# Some Helpful Code

## Content
  - [**VTEX** | Data Entities API](#data-entities-api)
  - [Get URL params as object](#get-url-params-as-object)
  - [Check wether user is logged in or not](#check-wether-user-is-logged-in-or-not)

# Data Entities API
Get entities based on created **acronym**

```js
let ACRONYM = 'CC';

$.ajax({
    url: `/api/dataentities/${ACRONYM}/search?phone=940028922&_fields=name,mail`,
    headers: { Accept: "application/vnd.vtex.ds.v10+json", "Content-Type": "application/json" },
    success: console.log
});
```

# Get URL params as object
Get url params as an unique object

```js
const SEARCH = location.search.substring(1);
const PARAMS = decodeURI(SEARCH).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"');
const PARSED_OBJECT = JSON.parse(`{"${PARAMS}"}`);

// url: ?license=myLicense&id=2
console.log(PARSED_OBJECT) // { license: "myLicense", id: "2" }
```

# Check wether user is logged in or not

We can check this using the `$.ajax` function or even the global `vtexjs` variable. <br />
You can use `$.ajax` if you can't wait for the `vtexjs` variable to load.

```js
// first one
const isLoggedIn = vtexjs.checkout.orderForm.loggedIn;
```

```js
// second one
$.ajax({
  url: '/no-cache/profileSystem/getProfile',
  success: ({ IsUserDefined }) => {
    if (IsUserDefined) {
      // user is defined
      return;
    }
    
    // user is not defined
  }
});
```
