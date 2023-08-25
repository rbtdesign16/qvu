import { intersection } from "./helper";

export const DEFAULT_ADMINISTRATOR_ROLE = "administrator";
export const DEFAULT_QUERY_DESIGNER_ROLE = "query designer";
export const DEFAULT_REPORT_DESIGNER_ROLE = "report designer";

export const BASE_ROLES = [DEFAULT_ADMINISTRATOR_ROLE, DEFAULT_QUERY_DESIGNER_ROLE, DEFAULT_REPORT_DESIGNER_ROLE];


export const ADMIN_USER_ID = "admin";

export const SECURITY_TYPE_BASIC = "basic";
export const SECURITY_TYPE_SAML = "saml";
export const SECURITY_TYPE_OIDC = "oidc";

export const SECURITY_TYPES = [SECURITY_TYPE_BASIC, SECURITY_TYPE_SAML,SECURITY_TYPE_OIDC];

export const userHasRole = (authData, role) => {
    if (authData.currentUser && authData.currentUser.roles) {
        return authData.currentUser.roles.includes(role);
    }
};

export const isAdministrator = (authData) => {
   return  userHasRole(authData, DEFAULT_ADMINISTRATOR_ROLE);
};

export const isQueryDesigner = (authData) => {
    return userHasRole(authData, DEFAULT_QUERY_DESIGNER_ROLE);
};

export const isReportDesigner = (authData) => {
    return userHasRole(authData, DEFAULT_REPORT_DESIGNER_ROLE);
};

export const isUser = (authData) => {
    return userHasRole(authData, authData.userRole);
};

export const hasRoleAccess = (requiredRoles, userRoles) => {
    let retval = false;
    if (!requiredRoles || (requiredRoles.length === 0)) {
        retval = true;
    } else if (userRoles && (userRoles.length > 0)) {
        let int =  intersection(requiredRoles, userRoles);
        retval = (int && (int.length > 0));
    }    
    
    return retval;
};
