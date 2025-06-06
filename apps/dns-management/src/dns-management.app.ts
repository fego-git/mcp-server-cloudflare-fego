import OAuthProvider from '@cloudflare/workers-oauth-provider'
import { McpAgent } from 'agents/mcp'

import { handleApiTokenMode, isApiTokenRequest } from '@repo/mcp-common/src/api-token-mode'
import {
        createAuthHandlers,
        handleTokenExchangeCallback,
} from '@repo/mcp-common/src/cloudflare-oauth-handler'
import { getUserDetails, UserDetails } from '@repo/mcp-common/src/durable-objects/user_details.do'
import { getEnv } from '@repo/mcp-common/src/env'
import { RequiredScopes } from '@repo/mcp-common/src/scopes'
import { CloudflareMCPServer } from '@repo/mcp-common/src/server'
import { registerAccountTools } from '@repo/mcp-common/src/tools/account.tools'
import { registerZoneTools } from '@repo/mcp-common/src/tools/zone.tools'
import { registerDnsTools } from '@repo/mcp-common/src/tools/dns.tools'

import { MetricsTracker } from '../../../packages/mcp-observability/src'

import type { AuthProps } from '@repo/mcp-common/src/cloudflare-oauth-handler'
import type { Env } from './dns-management.context'

export { UserDetails }

const env = getEnv<Env>()

const metrics = new MetricsTracker(env.MCP_METRICS, {
        name: env.MCP_SERVER_NAME,
        version: env.MCP_SERVER_VERSION,
})

export type Props = AuthProps

export type State = { activeAccountId: string | null }

export class DNSManagementMCP extends McpAgent<Env, State, Props> {
        _server: CloudflareMCPServer | undefined
        set server(server: CloudflareMCPServer) {
                this._server = server
        }
        get server(): CloudflareMCPServer {
                if (!this._server) {
                        throw new Error('Tried to access server before it was initialized')
                }
                return this._server
        }

        constructor(ctx: DurableObjectState, env: Env) {
                super(ctx, env)
        }

        async init() {
                this.server = new CloudflareMCPServer({
                        userId: this.props.user.id,
                        wae: this.env.MCP_METRICS,
                        serverInfo: {
                                name: this.env.MCP_SERVER_NAME,
                                version: this.env.MCP_SERVER_VERSION,
                        },
                })

                registerAccountTools(this)
                registerZoneTools(this)
                registerDnsTools(this)
        }

        async getActiveAccountId() {
                try {
                        const userDetails = getUserDetails(env, this.props.user.id)
                        return await userDetails.getActiveAccountId()
                } catch (e) {
                        this.server.recordError(e)
                        return null
                }
        }

        async setActiveAccountId(accountId: string) {
                try {
                        const userDetails = getUserDetails(env, this.props.user.id)
                        await userDetails.setActiveAccountId(accountId)
                } catch (e) {
                        this.server.recordError(e)
                }
        }
}

const DNSManagementScopes = {
        ...RequiredScopes,
        'account:read': 'See your account info such as account details, analytics, and memberships.',
        'dns:write': 'See, edit and delete your DNS zone settings and records',
} as const

export default {
        fetch: async (req: Request, env: Env, ctx: ExecutionContext) => {
                if (await isApiTokenRequest(req, env)) {
                        return await handleApiTokenMode(DNSManagementMCP, req, env, ctx)
                }

                return new OAuthProvider({
                        apiHandlers: {
                                '/mcp': DNSManagementMCP.serve('/mcp'),
                                '/sse': DNSManagementMCP.serveSSE('/sse'),
                        },
                        // @ts-ignore
                        defaultHandler: createAuthHandlers({ scopes: DNSManagementScopes, metrics }),
                        authorizeEndpoint: '/oauth/authorize',
                        tokenEndpoint: '/token',
                        tokenExchangeCallback: (options) =>
                                handleTokenExchangeCallback(options, env.CLOUDFLARE_CLIENT_ID, env.CLOUDFLARE_CLIENT_SECRET),
                        accessTokenTTL: 3600,
                        clientRegistrationEndpoint: '/register',
                }).fetch(req, env, ctx)
        },
}
