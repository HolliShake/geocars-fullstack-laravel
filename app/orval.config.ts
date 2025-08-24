module.exports = {
  api: {
    baseUrl: '/api',
    input: {
      target: '../api/public/openapi.json',
    },
    output: {
      target: './rest/api.ts',
      schemas: './rest/models',
      client: 'react-query',
      mode: 'single',
      override: {
        mutator: {
          path: './rest/axios.ts',
          name: 'fetchData',
        },
      },
    },
  },
};
