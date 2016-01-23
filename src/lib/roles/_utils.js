//register actions
Roles.registerAction("collections.entries.access", true);

Roles.debug = true;

// check that the userId specified owns the documents
ownsDocument = function (userId, doc) {
    return doc && doc.publisher === userId || Roles.userHasRole(userId, "admin");
};

ownsDocumentQuery = function () {
    return {publisher: this.userId};
};

viewsDocument = function (userId, doc) {
    if (!userId) {
        return doc.aclMeta;
    }

    if (doc) {
        return doc.aclMeta // publicly listed entries
            || ownsDocument(userId, doc) // own entries
            || (doc.metaWhiteList && _.contains(doc.metaWhiteList, userId)) // white-listed user
            || Groups.find({contentWhiteList: userId}).fetch().some(group => viewsDocument(group.publisher, doc)); // member of white-listed groups, for null userId returning true if group doesn't have contentWhhiteList property
    } else {
        return false;
    }
};

accessesDocument = function (userId, doc) {
    if (!userId) {
        return doc.aclContent;
    }

    if (doc) {
        return doc.aclContent
            || ownsDocument(userId, doc)
            || (doc.contentWhiteList && _.contains(doc.contentWhiteList, userId))
            || Groups.find({contentWhiteList: userId}).fetch().some(group => accessesDocument(group.publisher, doc)); // member of white-listed groups
    } else {
        return false;
    }
};

viewsDocumentQuery = function (userId) {

    //anonymous user default
    let query = {$or: [{aclMeta: true}]};

    //logged in user
    if (userId) {
        //admin user
        if (Roles.userHasRole(userId, "admin")) {
            query = {$or: [{}]};
        } else {
            //individual or group user
            query = {$or: [{aclMeta: true}, {metaWhiteList: userId}, {publisher: userId}, {contentWhiteList: userId}]};//individual permission
            let groups = Groups.find({contentWhiteList: userId});
            //group permission
            groups.forEach(function (group) {
                query.$or.push({metaWhiteList: group.publisher});
            });
        }
    }

    return query;
};

isMemberQuery = function () {
    return {contentWhiteList: this.userId};
};

//set @Role's permission according to @colRules
//@colRules is of the form {collection_name: [allowed_field]}
//if allowed_field is a string set permission to true
//if allowed_field is a function, compute permission using the function
setCollectionGrants = function (Role, colRules) {
    for (let colName in colRules) {
        if (colRules.hasOwnProperty(colName)) {
            setRuleArray(Role, colName, colRules[colName]);
        }
    }
};

function setRuleArray(Role, colName, fields) {
    
    for(let action in fields) {
        if (fields.hasOwnProperty(action)) {
            let field = fields[action];
            
            if (typeof field === 'string') {
                Role.allow('collections.' + colName + '.' + field, true);
            }

            if (typeof field === 'function') {
                Role.allow('collections.' + colName + '.' + action, field);
            }
        }
    }
};
