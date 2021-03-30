# Some Helpful Code

## Content
  - [**VTEX** | Data Entities API](#data-entities-api)
  - [Get URL params as object](#get-url-params-as-object)
  - [Check wether user is logged in or not](#check-wether-user-is-logged-in-or-not)
  - [Convert date to ages](#convert-date-to-ages)

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

# Convert date to ages

You can use this if you're receiving some date coming from the `date html input` and want it to be calculated in ages.

```js
const getAge = (birth) => {
  let today = new Date();
  ageMS = Date.parse(Date()) - Date.parse(birth);
  today.setTime(ageMS);
  age = today.getFullYear() - 1970;

  return age || 0;
}

// use cases - 30/03/2021
getAge('2004-01-05') // 17
getAge('2003-03-30') // if i'm turning 18 today - 18
getAge('') // 0
```
