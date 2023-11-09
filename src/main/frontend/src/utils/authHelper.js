import { intersection } from "./helper";

export const ADMINISTRATOR_ROLE = "administrator";
export const QUERY_DESIGNER_ROLE = "query designer";
export const REPORT_DESIGNER_ROLE = "report designer";

export const BASE_ROLES = [ADMINISTRATOR_ROLE, QUERY_DESIGNER_ROLE, REPORT_DESIGNER_ROLE];
export const ADMIN_USER_ID = "admin";
export const SECURITY_TYPE_BASIC = "basic";
export const SECURITY_TYPE_OIDC = "oidc";

export const SECURITY_TYPES = [SECURITY_TYPE_BASIC, SECURITY_TYPE_OIDC];

export const userHasRole = (authData, role) => {
    if (authData && authData.currentUser && authData.currentUser.roles) {
        return authData.currentUser.roles.includes(role);
    }
};

export const isAdministrator = (authData) => {
   return  userHasRole(authData, ADMINISTRATOR_ROLE);
};

export const isQueryDesigner = (authData) => {
    return userHasRole(authData, QUERY_DESIGNER_ROLE);
};

export const isReportDesigner = (authData) => {
    return userHasRole(authData, REPORT_DESIGNER_ROLE);
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
