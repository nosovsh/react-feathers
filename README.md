# react-feathers
React components and hocs for [Feathers](https://feathersjs.com) REST library. 

[react-apollo](https://github.com/apollographql/react-apollo) inspired API.
Uses [feathers-client](https://github.com/feathersjs/client) to actually do requests.
Uses [redux](https://redux.js.org/) for data storage.

**Warning: library is under active development!**

## Install
```
npm install feathers-client redux react-redux --save
npm install react-feathers --save
```

## Usage
### Inject feathers services
```javascript

import feathers from 'feathers-client';
import {reducer as feathersReducer} from 'react-feathers';
import {FeathersProvider} from 'react-feathers';
import {combineReducers} from 'redux';


// configure redux
const rootReducer = combineReducers({
  feathers: feathersReducer, // will be moved to separate redux store
});

const store = ...

// configure `feathers-client`
const feathersApp = feathers()
  .configure(feathers.hooks())
  .configure(feathers.rest(API_HOST).fetch(window.fetch));

// we suppose that you have "users" service
const users = feathers.service('users');  

// Somewhere in your top level component

ReactDOM.render((
  <Provider store={store}>
      <FeathersProvider
        services={{
          users,
        }}
        dataIdFromObject={obj => obj._id} /* how to get id from any db object */
      >
        <App />
      </FeathersProvider>
  </Provider>
));
```

### Usage anywhere in your app

##### find:

```javascript
import React from 'react';
import { withQueryFeathers } from 'react-feathers';

const UsersList = ({ data }) => {
  return (
    <div>
      {data.loaded && (
        <div>
          {data.result.data.length ? (
            <ul>
                {data.result.data.map((user) => (
                  <li
                    key={user._id}
                  >
                    {user.name}
                  </li>
                ))}
            </ul>
          ) : (
            <div>
              No users found
            </div>
          )}
        </div>
      ) : (
        Loading...
      )}
    </div>
  );
};

export default withQueryFeathers({
  service: 'users',
  method: 'find',
  params: props => ({
    query: {
      role: props.role,
    },
  }), // or just plain object 
})(UsersList);


// Usage
const App = () => (
    <UsersList role="admin" />
)
```

##### get:

```javascript
// TODO

export default withQueryFeathers({
  service: 'users',
  method: 'get',
  id (?): props => user.id, // or plain string
})(YourComponent);
```
##### create:

```javascript
import React from 'react';
import { withMutationFeathers } from 'react-feathers';

const CreateUserForm = ({create}) => {
    const createUser = () => {
        create({
            name: 'user name'
        }).then(result => {
          console.log('User created successfully', result)
        }, error => {
          console.log('User creation error', error)
          throw error;
        });
      };
    return (
        <button
            onClick={createUser}
        >
            Create user with name 'user name'
        </button>
    )
}

export default withMutationFeathers({
  service: 'users',
  method: 'create',
})(CreateUserForm);

// usage:
const App = () => (
    <CreateUserForm />
)

```

##### update:

```javascript
import React from 'react';
import { withMutationFeathers } from 'react-feathers';

const UpdateUserForm = ({update}) => {
    const updateUser = () => {
        update('<user id>', {
            name: 'new name'
        }).then(result => {
          console.log('User updated successfully', result)
        }, error => {
          console.log('User updating error', error)
          throw error;
        });
      };
    return (
        <button
            onClick={updateUser}
        >
            Update user with id '<user id>'
        </button>
    )
}

export default withMutationFeathers({
  service: 'users',
  method: 'update',
})(UpdateUserForm);

// usage:
const App = () => (
    <UpdateUserForm />
)
```

## TODO:
 - [ ] Implement `delete` method
 - [ ] Possibility to rename `data` prop
 - [ ] support of `fields` in requests
 - [ ] Hide redux usage form user
 - [ ] Avoid unnecessary rerendering
 - [ ] Implement render function components API
