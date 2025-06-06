import { MISSING_ACCOUNT_ID_RESPONSE } from '../constants'
import { type CloudflareMcpAgent } from '../types/cloudflare-mcp-agent.types'
import {
        DNSZoneIdParam,
        DNSRecordIdParam,
        DNSRecordTypeParam,
        DNSRecordNameParam,
        DNSRecordContentParam,
        DNSRecordTTLParam,
        DNSRecordProxiedParam,
} from '../types/dns.types'
import { createDnsRecord, updateDnsRecord, deleteDnsRecord } from '../api/dns.api'

export function registerDnsTools(agent: CloudflareMcpAgent) {
        agent.server.tool(
                'dns_record_create',
                'Create a DNS record in a zone',
                {
                        zoneId: DNSZoneIdParam,
                        type: DNSRecordTypeParam,
                        name: DNSRecordNameParam,
                        content: DNSRecordContentParam,
                        ttl: DNSRecordTTLParam,
                        proxied: DNSRecordProxiedParam,
                },
                async ({ zoneId, type, name, content, ttl, proxied }) => {
                        const accountId = await agent.getActiveAccountId()
                        if (!accountId) {
                                return MISSING_ACCOUNT_ID_RESPONSE
                        }
                        try {
                                const result = await createDnsRecord({
                                        accountId,
                                        zoneId,
                                        apiToken: agent.props.accessToken,
                                        record: {
                                                type,
                                                name,
                                                content,
                                                ttl: ttl ?? undefined,
                                                proxied: proxied ?? undefined,
                                        },
                                })
                                return { content: [{ type: 'text', text: JSON.stringify(result) }] }
                        } catch (error) {
                                return {
                                        content: [
                                                {
                                                        type: 'text',
                                                        text: `Error creating DNS record: ${
                                                                error instanceof Error ? error.message : String(error)
                                                        }`,
                                                },
                                        ],
                                }
                        }
                }
        )

        agent.server.tool(
                'dns_record_update',
                'Update a DNS record in a zone',
                {
                        zoneId: DNSZoneIdParam,
                        recordId: DNSRecordIdParam,
                        type: DNSRecordTypeParam,
                        name: DNSRecordNameParam,
                        content: DNSRecordContentParam,
                        ttl: DNSRecordTTLParam,
                        proxied: DNSRecordProxiedParam,
                },
                async ({ zoneId, recordId, type, name, content, ttl, proxied }) => {
                        const accountId = await agent.getActiveAccountId()
                        if (!accountId) {
                                return MISSING_ACCOUNT_ID_RESPONSE
                        }
                        try {
                                const result = await updateDnsRecord({
                                        accountId,
                                        zoneId,
                                        recordId,
                                        apiToken: agent.props.accessToken,
                                        record: {
                                                type,
                                                name,
                                                content,
                                                ttl: ttl ?? undefined,
                                                proxied: proxied ?? undefined,
                                        },
                                })
                                return { content: [{ type: 'text', text: JSON.stringify(result) }] }
                        } catch (error) {
                                return {
                                        content: [
                                                {
                                                        type: 'text',
                                                        text: `Error updating DNS record: ${
                                                                error instanceof Error ? error.message : String(error)
                                                        }`,
                                                },
                                        ],
                                }
                        }
                }
        )

        agent.server.tool(
                'dns_record_delete',
                'Delete a DNS record from a zone',
                {
                        zoneId: DNSZoneIdParam,
                        recordId: DNSRecordIdParam,
                },
                async ({ zoneId, recordId }) => {
                        const accountId = await agent.getActiveAccountId()
                        if (!accountId) {
                                return MISSING_ACCOUNT_ID_RESPONSE
                        }
                        try {
                                const result = await deleteDnsRecord({
                                        accountId,
                                        zoneId,
                                        recordId,
                                        apiToken: agent.props.accessToken,
                                })
                                return { content: [{ type: 'text', text: JSON.stringify(result) }] }
                        } catch (error) {
                                return {
                                        content: [
                                                {
                                                        type: 'text',
                                                        text: `Error deleting DNS record: ${
                                                                error instanceof Error ? error.message : String(error)
                                                        }`,
                                                },
                                        ],
                                }
                        }
                }
        )
}
