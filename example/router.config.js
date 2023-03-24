/** @type import("../dist/index").Route */
export default {
  '/': './src/App',
  '/demo': {
    src: './src/Demo',
    dynamic: true,
    async loader() {
      console.log('hello, vite-plugin-react-router');
      return null;
    },
  },
  '/dev': {
    '/': {
      src: './src/App',
      children: {
        '/dev/children': {
          src: './src/Demo',
          dynamic: true,
          async loader() {
            console.log('hello, children');
            return null;
          },
        },
      },
    },
    '/demo': './src/App',
  },
};
