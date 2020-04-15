# Overview
A random collection of node scripts to get things done

## Getting Started
This are simple stand alone node scripts.  

Step One. Install dependencies.
```
npm install
```

Most scripts will require a bearer token.  For simplicity, most scripts have a `token` variable you can set with a valid token.


Step Two.  Execute Desired Scripts
```
node ./duplicate-employee.js
```

```
node ./production-organziation.js
```


## The scripts

### duplicate-employee.js
This was an example script written for PSST to check on employees that PSST reported coming back as they pages results.

### production-organizations.js
Finance wanted a count of platform cusotmers.  The Org server contains all our platform orgs.  Unfortunately, we don't have a create way to report from this service.  Fuirthermore, there are a lot of dead, test and demo orgs.  This scripts gets all the orgs and weeds out those maked as deleted or have 'Frontline', 'Test' or 'Inactive' in the the org's name.  Not perfect but close enough.  We then transform the org payload to into a csv and output some files to to an `output` subdirectory.



