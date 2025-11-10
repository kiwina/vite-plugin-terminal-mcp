import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  entries: [
    'src/index',
  ],
  clean: false,
  declaration: true,
  externals: [
    'vite',
    '@modelcontextprotocol/sdk',
    '@modelcontextprotocol/sdk/server/mcp.js',
    '@modelcontextprotocol/sdk/server/streamableHttp.js',
  ],
  rollup: {
    emitCJS: true,
  },
  failOnWarn: false,
})
