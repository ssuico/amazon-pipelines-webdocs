import { defineConfig } from 'vitepress'
import { withMermaid } from 'vitepress-plugin-mermaid'

export default withMermaid(
  defineConfig({
    title: 'Amazon Pipelines',
    description: 'Documentation for Amazon SP-API and Ads API data pipelines',
    lang: 'en-US',
    cleanUrls: true,
    lastUpdated: true,
    ignoreDeadLinks: [/^http:\/\/localhost/],
    markdown: {
      lineNumbers: true,
    },
    head: [
      ['link', { rel: 'icon', href: '/favicon.svg', type: 'image/svg+xml' }],
      ['link', { rel: 'icon', href: '/favicon.ico', sizes: 'any' }],
      ['link', { rel: 'apple-touch-icon', href: '/apple-touch-icon.png' }],
      ['meta', { name: 'theme-color', content: '#3c8772' }],
    ],
    themeConfig: {
      nav: [
        { text: 'Overview', link: '/' },
        { text: 'Getting Started', link: '/getting-started' },
        {
          text: 'Architecture',
          items: [
            { text: 'Overview', link: '/architecture/' },
            { text: 'Data Flow', link: '/architecture/data-flow' },
            { text: 'Components', link: '/architecture/components' },
          ],
        },
        {
          text: 'Pipelines',
          items: [
            { text: 'Overview', link: '/pipelines/' },
            { text: 'SP Pipeline', link: '/pipelines/sp-pipeline' },
            { text: 'Ads Pipeline', link: '/pipelines/ads-pipeline' },
            { text: 'Batch Scheduling', link: '/pipelines/batch-scheduling' },
          ],
        },
        {
          text: 'Operations',
          items: [
            { text: 'Runbook', link: '/operations/' },
            { text: 'Monitoring', link: '/operations/monitoring' },
            { text: 'Scheduled Jobs', link: '/operations/scheduled-jobs' },
          ],
        },
        {
          text: 'Reference',
          items: [
            { text: 'API Endpoints', link: '/reference/endpoints' },
            { text: 'Environment Variables', link: '/reference/environment-variables' },
            { text: 'SP Report Types', link: '/reference/sp-report-types' },
            { text: 'Ads Report Types', link: '/reference/ads-report-types' },
          ],
        },
        { text: 'Developer', link: '/developer/' },
        { text: 'FAQ', link: '/faq' },
      ],
      sidebar: {
        '/': [
          {
            text: 'Introduction',
            items: [
              { text: 'Platform Overview', link: '/' },
              { text: 'Getting Started', link: '/getting-started' },
              { text: 'FAQ', link: '/faq' },
            ],
          },
        ],
        '/architecture/': [
          {
            text: 'Architecture',
            items: [
              { text: 'Overview', link: '/architecture/' },
              { text: 'Data Flow', link: '/architecture/data-flow' },
              { text: 'Components', link: '/architecture/components' },
            ],
          },
        ],
        '/integrations/': [
          {
            text: 'Integrations',
            items: [
              { text: 'Overview', link: '/integrations/' },
              { text: 'Amazon SP-API', link: '/integrations/sp-api' },
              { text: 'Amazon Ads API', link: '/integrations/ads-api' },
            ],
          },
        ],
        '/pipelines/': [
          {
            text: 'Pipelines',
            items: [
              { text: 'Overview', link: '/pipelines/' },
              { text: 'SP Pipeline', link: '/pipelines/sp-pipeline' },
              { text: 'Ads Pipeline', link: '/pipelines/ads-pipeline' },
              { text: 'Data Flow & Processing', link: '/pipelines/data-flow-processing' },
              { text: 'Batch Scheduling', link: '/pipelines/batch-scheduling' },
            ],
          },
        ],
        '/onboarding/': [
          {
            text: 'Onboarding',
            items: [
              { text: 'Overview', link: '/onboarding/' },
              { text: 'Brand Onboarding', link: '/onboarding/brand-onboarding' },
              { text: 'Credentials & Auth', link: '/onboarding/credentials' },
            ],
          },
        ],
        '/operations/': [
          {
            text: 'Operations',
            items: [
              { text: 'Runbook', link: '/operations/' },
              { text: 'Monitoring', link: '/operations/monitoring' },
              { text: 'Failed Reports', link: '/operations/failed-reports' },
              { text: 'Scheduled Jobs', link: '/operations/scheduled-jobs' },
              { text: 'Operational Scripts', link: '/operations/scripts' },
              { text: 'Dashboard SQL', link: '/operations/dashboard-queries' },
            ],
          },
        ],
        '/deployment/': [
          {
            text: 'Deployment',
            items: [
              { text: 'Overview', link: '/deployment/' },
              { text: 'Infrastructure', link: '/deployment/infrastructure' },
              { text: 'Cloud Run', link: '/deployment/cloud-run' },
              { text: 'Cloud Tasks & Scheduler', link: '/deployment/cloud-tasks-scheduler' },
            ],
          },
        ],
        '/reference/': [
          {
            text: 'Reference',
            items: [
              { text: 'Overview', link: '/reference/' },
              { text: 'API Endpoints', link: '/reference/endpoints' },
              { text: 'Environment Variables', link: '/reference/environment-variables' },
              { text: 'SP Report Types', link: '/reference/sp-report-types' },
              { text: 'Ads Report Types', link: '/reference/ads-report-types' },
              { text: 'SP Schemas', link: '/reference/sp-schemas' },
              { text: 'BigQuery & Datasets', link: '/reference/bigquery' },
              { text: 'Legacy Migration', link: '/reference/migration-legacy' },
            ],
          },
        ],
        '/developer/': [
          {
            text: 'Developer Guide',
            items: [
              { text: 'Overview', link: '/developer/' },
              { text: 'Local Development', link: '/developer/local-development' },
              { text: 'Testing', link: '/developer/testing' },
              { text: 'Adding an SP Report', link: '/developer/adding-sp-report' },
              {
                text: 'Design Decisions',
                collapsed: false,
                items: [
                  { text: 'Index', link: '/developer/design-decisions/' },
                  { text: 'BigQuery Caching', link: '/developer/design-decisions/bigquery-caching' },
                  { text: 'Dead Code Cleanup', link: '/developer/design-decisions/dead-code-cleanup' },
                  { text: 'Research App Override', link: '/developer/design-decisions/research-app-override' },
                  { text: 'Cloud Run Memory', link: '/developer/design-decisions/cloud-run-memory' },
                ],
              },
            ],
          },
        ],
        '/troubleshooting/': [
          {
            text: 'Troubleshooting',
            items: [
              { text: 'Overview', link: '/troubleshooting/' },
              { text: 'Common Issues', link: '/troubleshooting/common-issues' },
              { text: 'SP Status Tracker', link: '/troubleshooting/sp-status-tracker' },
            ],
          },
        ],
      },
      search: {
        provider: 'local',
      },
      socialLinks: [],
      footer: {
        message: 'Amazon Pipelines Documentation',
        copyright: 'Internal use — Research Analytics',
      },
      outline: { level: [2, 3] },
    },
  })
)
