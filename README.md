## vite-plugin-react-router-dom

A simple plugin intends to simplify code structure when using react-router with vite. Supports dynamic imports.

Before:

```javascript
import { createBrowserRouter } from 'react-router-dom';
import { lazy } from 'react';
import App from './App';
const Demo = lazy(() => import('./Demo'));

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <App />,
    },
    {
      path: '/demo',
      element: <Demo />,
    },
  ],
  {},
);

export default router;
```

After:

```javascript
// router.config.js
export default {
  '/': './App',
  '/demo': {
    src: './Demo',
    dynamic: true,
  },
};
```

See `example/router.config.js` for more usages.

### Install

```
npm install --save-dev vite-plugin-react-router-dom
```
