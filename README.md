# Some Helpful Code

## Content
  - [**VTEX** | Data Entities API](#data-entities-api)
  - [Get URL params as object](#get-url-params-as-object)

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
const PARAMS = decodeURI(search).replace(/"/g, '\\"').replace(/&/g, '","').replace(/=/g, '":"');
const PARSED_OBJECT = JSON.parse(`{"${params}"}`);

// url: ?license=myLicense&id=2
console.log(PARSED_OBJECT) // { license: "myLicense", id: "2" }
```
