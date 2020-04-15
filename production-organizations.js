const Request = require("request-promise");
const fs = require("fs");

let token = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6IlNjRUNPN3JUZDJFc3dsdkVYeHRiazVONGFNbyIsImtpZCI6IlNjRUNPN3JUZDJFc3dsdkVYeHRiazVONGFNbyJ9.eyJpc3MiOiJodHRwczovL2xvZ2luLmZyb250bGluZWVkdWNhdGlvbi5jb20vIiwiYXVkIjoiaHR0cHM6Ly9sb2dpbi5mcm9udGxpbmVlZHVjYXRpb24uY29tL3Jlc291cmNlcyIsImV4cCI6MTU4Njk3NTkyNSwibmJmIjoxNTg2OTcyMzI1LCJjbGllbnRfaWQiOiJzd2FnZ2VyQ2xpZW50Iiwic2NvcGUiOlsiZmxhcGkucHVibGljIiwiZmxhcGkub3JnYW5pemF0aW9uc2VydmljZSJdLCJzdWIiOiIxMDA5MyIsImF1dGhfdGltZSI6MTU4Njk3MjMyNSwiaWRwIjoiZnJvbnRsaW5lIiwicm9sZSI6IklkbUFkbWluaXN0cmF0b3IiLCJsb2NhbGUiOiJlbiIsImZsaWQiOiIxMDA5MyIsImVtcGxveWVlIjpbImNjZDA5YjU1LTExYjMtNGM4Yy04ZGE4LWMzODFkNzNlZmNiYyIsIjNkNjQ2MzhjLTA5M2QtNDc5Yi04YjUxLTRjNDlhNDcxODRhOCIsIjVmN2RhOGRlLTFhZDAtNDdlMC05NzdlLWFjYTZkNTdhODYxYyJdLCJyZWNydWl0X3VzZXIiOlsiaHJtc2RlbW98NHxraGFyc2hhdyIsImRldmhybXNjc2RlbW98M3xraGFyc2hhdyJdLCJ0ZWFtc19hY3RpdmVfcGVyc29uIjoiNDAzOTUzMCIsImFic190aW1lX2VtcGxveWVlIjoiMi05NTMzMDk4IiwiYWJzX3RpbWVfb3JndXNlciI6IjQtMTAyNjM5MiIsIm9yZ2FuaXphdGlvbmlkIjpbIjIwMDAxIiwiNjc4MTUiLCI2ODIzMyJdLCJhbXIiOlsicGFzc3dvcmQiXSwib3JnX3VzZXJfbWFwIjpbeyJPcmdJZCI6IjIwMDAxIiwiVXNlcklkIjoiODk3MzgiLCJPcmdQZXJzb25JZCI6bnVsbH0seyJPcmdJZCI6IjY3ODE1IiwiVXNlcklkIjoiMTIzNjAyMzkiLCJPcmdQZXJzb25JZCI6IjAyODliMjZlLTAwMmMtNGY2Yi04MzhkLTgzZjJkY2NiMDQ4ZCJ9LHsiT3JnSWQiOiI2ODIzMyIsIlVzZXJJZCI6IjE1ODA4MjA4IiwiT3JnUGVyc29uSWQiOiJjZmNhMDY0Ny1kZTFkLTRjZjktYjcyMi1kYmNiMGM4NTRlODkifV19.RKAQLb2glvnG1U9IxzibB9y41YnZL8Hl1M6qcesMeQKXdBgF22tRwATpAUwKL1FWHTL6w-McfV2OxS7GFVzgf78m1Fo7lSOxtb8aOfF1wvC1tMSRauvSTk5lSucVmt5Vs87EgxHpQiTFbr3ie0rFiWMYVQqXMd1E7rRzxvuHHl9igwDLVXcZWIBbR-5a_I34YR3LlpGA1iXg96elgRUVD2B1ej5s60djvOIjPmX4gGzbKEjoiszIFTKJB40mqL-_NiWRzRwGzSoPG6jxQlm6NwpzoZkLdPd2QvhIa2WxveN0U78o7wNCIUqC7vbdGrY3FCYyByUbkW5uRV6t9ucHSA";

const PAGE_SIZE = 50;
const MAX_PAGES = 1;
const CSV_OUTPUT_FILEPATH = './output/orgs.csv';

const main = async () => {
    let orgs = await getAllOrganizations(token);
    console.log(`All Org Count: ${orgs.length}`);
    storeData(orgs, './output/all-orgs.json');

    let activeOrgs = filterActiveOnly(orgs);
    console.log(`Active Org Count: ${activeOrgs.length}`);
    storeData(activeOrgs, './output/active-orgs.json');

    let nonTestOrgs = filterTestFrontlineInactive(activeOrgs);
    console.log(`Non-Frontline and non-Test Org Count: ${nonTestOrgs.length}`)
    storeData(nonTestOrgs, './output/non-test-orgs.json');

    writeCSV(nonTestOrgs)

}

const storeData = (data, path) => {
    try {
      fs.writeFileSync(path, JSON.stringify(data))
    } catch (err) {
      console.error(err)
    }
}

const getPageOfOrganizations = async (token, pageNumber) => {
    let offset = pageNumber * PAGE_SIZE;

    const orgRequest = {
        uri: `https://api2.frontlineeducation.com/OrganizationApi/api/Organizations?fields=id%2Cname%2Cdeleted%2CdeletedUTC&offset=${offset}&limit=${PAGE_SIZE}&suppressMetadata=true`,
        json: true,
        resolveWithFullResponse: true,
        headers: {
            'Authorization': `Bearer ${token}`
        }
    };

    let response = [];

    try {
        response = await Request(orgRequest);

    } catch(e) {
        console.log(e);
        return { data: [] };
    }

    return response;
}

const getAllOrganizations = async (token) => {
    let orgs = [];
    let more = true;
    let page = 0;

    while (more) {
        let response = await getPageOfOrganizations(token, page);
        
        page++;
        
        await orgs.push.apply(orgs, response.body.data);

        more = response.statusCode === 206; 

        if (page > MAX_PAGES) {
            console.log(`Bailing out early.  Too many iterations.  MAX_PAGES: ${MAX_PAGES}`);
            return orgs;
        }
        console.log(`Getting page: ${page}`);
    }

    return orgs;
}

let filterActiveOnly = (orgList) => {
    return orgList.filter(o => o.attributes.deleted === false);
}

let filterTestFrontlineInactive = (orgList) => {
    return orgList.filter(o => 
        !o.attributes.name.toLowerCase().includes('frontline') && 
        !o.attributes.name.toLowerCase().includes('test') &&
        !o.attributes.name.toLowerCase().includes('inactive'));
}

const writeCSV = (orgList) => {
    let csv = fs.createWriteStream(CSV_OUTPUT_FILEPATH);

    orgList.forEach(o => {
        csv.write(`${o.id},${o.attributes.name},${o.attributes.deleted}\n`);
    });

    csv.end();
}

main();
