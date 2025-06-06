import { z } from 'zod'

export const DNSZoneIdParam = z.string().describe('The zone ID the DNS record belongs to')
export const DNSRecordIdParam = z.string().describe('The identifier of the DNS record')
export const DNSRecordTypeParam = z
        .enum(['A', 'AAAA', 'CNAME', 'TXT', 'MX', 'NS', 'SRV', 'CAA'])
        .describe('DNS record type')
export const DNSRecordNameParam = z.string().describe('DNS record name')
export const DNSRecordContentParam = z.string().describe('DNS record content')
export const DNSRecordTTLParam = z.number().optional().describe('Time to live in seconds')
export const DNSRecordProxiedParam = z.boolean().optional().describe('Whether Cloudflare proxy is enabled')
