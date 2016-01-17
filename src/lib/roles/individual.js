Options.set('defaultRoles', ['individual']);
/*
 * First you must define the role
 */
let Atom = new Roles.Role('individual'),
    allows = {
        entries: [function access(entry) {
            return accessesDocument(this.userId, entry);
        }],
        datasets: ['index', 'insert', 'update', 'remove', 'showCreate', 'showUpdate', 'showRemove'],
        apps: ['index', 'insert', 'update', 'remove', 'showCreate', 'showUpdate', 'showRemove'],
        comments: ['index', 'update', 'showUpdate'],
        groups: ['index']
    };

setCollectionGrants(Atom, allows);

Atom.helper('collections.datasets.indexFilter', ownsDocumentQuery);
Atom.helper('collections.apps.indexFilter', ownsDocumentQuery);
Atom.helper('collections.comments.indexFilter', ownsDocumentQuery);
Atom.helper('collections.groups.indexFilter', isMemberQuery);

//forbidden fields
Atom.helper('collections.datasets.forbiddenFields', datasetBlackList);
Atom.helper('collections.apps.forbiddenFields', appBlacklist);
Atom.helper('collections.comments.forbiddenFields', ['publisher', 'entryId', 'submitted']);
