const Request = require("request-promise");

let orgId = '58067';

let token = "PASTE YOUR TOKEN HERE";

const PAGE_SIZE = 50;
const MAX_PAGES = 200;

const main = async () => {
    let employees = await getAllEmployees(token, orgId);

    let dups = await findEmployeeDuplicates(employees);
    console.log(JSON.stringify(dups));
}

const getPageOfEmployees = async (token, organizationId, pageNumber) => {
    let offset = pageNumber * PAGE_SIZE;

    const employeeRequest = {
        uri: `https://api2.frontlineeducation.com/EmployeeApi/api/organizations/${organizationId}/employees?include=emails%2Caddresses%2CphoneNumbers%2CStatusHistory%2Csupervisors&offset=${offset}&limit=50&suppressMetadata=true`,
        json: true,
        resolveWithFullResponse: true,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    let response = [];

    try {
        response = await Request(employeeRequest);

    } catch(e) {
        console.log(e);
        return { data: [] };
    }

    return response;
}

const getAllEmployees = async (token, organizationId) => {
    let employees = [];
    let more = true;
    let page = 0;

    while (more) {
        let response = await getPageOfEmployees(token, organizationId, page);
        
        page++;
        
        await employees.push.apply(employees, response.body.data);


        more = response.statusCode === 206; 

        console.log(`Getting page: ${page}`);

        if (page > MAX_PAGES) {
            console.log(`Bailing out early.  Too many iterations.  Page: ${page}`);
            return employees;
        }
    }

    return employees;
}

let findEmployeeDuplicates = async (employeeList) => {
    
    let dupIds = [];
    let dups = [];

    let empIds = employeeList.map(e => e.id).sort();
    
    console.log('looking for dups');

    for (i = 0; i < empIds.length - 1; i++) {
        if (empIds[i] === empIds[i+1])
        {
            if (dupIds.indexOf(empIds[i]) !== -1) {
                dupIds.push(empIds[i]);
            }
        }
    }

    dupIds.forEach(id => {
        dups.push(employeeList.filter(e => e.id === id)[0])
    });

    return dups;

}

main();
