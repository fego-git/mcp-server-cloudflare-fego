import { fetchCloudflareApi } from '../cloudflare-api'

export async function createDnsRecord({
        accountId,
        zoneId,
        apiToken,
        record,
}: {
        accountId: string
        zoneId: string
        apiToken: string
        record: {
                type: string
                name: string
                content: string
                ttl?: number
                proxied?: boolean
        }
}) {
        return fetchCloudflareApi({
                endpoint: `/zones/${zoneId}/dns_records`,
                accountId,
                apiToken,
                options: {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(record),
                },
        })
}

export async function updateDnsRecord({
        accountId,
        zoneId,
        recordId,
        apiToken,
        record,
}: {
        accountId: string
        zoneId: string
        recordId: string
        apiToken: string
        record: {
                type: string
                name: string
                content: string
                ttl?: number
                proxied?: boolean
        }
}) {
        return fetchCloudflareApi({
                endpoint: `/zones/${zoneId}/dns_records/${recordId}`,
                accountId,
                apiToken,
                options: {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(record),
                },
        })
}

export async function deleteDnsRecord({
        accountId,
        zoneId,
        recordId,
        apiToken,
}: {
        accountId: string
        zoneId: string
        recordId: string
        apiToken: string
}) {
        return fetchCloudflareApi({
                endpoint: `/zones/${zoneId}/dns_records/${recordId}`,
                accountId,
                apiToken,
                options: { method: 'DELETE' },
        })
}
