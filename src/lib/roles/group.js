/**
 * Created by xgfd on 24/12/2015.
 */

let Molecule = new Roles.Role('group'),
    grants = {
        entries: {
            access(entry) {
                return accessesDocument(this.userId, entry);
            }
        },
        groups: ['index', 'update', 'showUpdate'],
        datasets: ['index', 'insert', 'update', 'remove', 'showUpdate', 'showRemove'],
        apps: ['index', 'insert', 'update', 'remove', 'showUpdate', 'showRemove'],
        licenses: ['index', 'insert', 'update', 'remove', 'showCreate', 'showUpdate', 'showRemove'],
        clients: ['index', 'insert', 'update', 'remove', 'showCreate', 'showUpdate', 'showRemove']
    };

setCollectionGrants(Molecule, grants);

Molecule.helper('collections.groups.indexFilter', ownsDocumentQuery);
Molecule.helper('collections.datasets.indexFilter', ownsDocumentQuery);
Molecule.helper('collections.apps.indexFilter', ownsDocumentQuery);
Molecule.helper('collections.clients.indexFilter', ownsDocumentQuery);
Molecule.helper('collections.licenses.indexFilter', ownsDocumentQuery);

//forbidden fields
Molecule.helper('collections.datasets.forbiddenFields', omitFields);
Molecule.helper('collections.apps.forbiddenFields', omitFields);
Molecule.helper('collections.clients.forbiddenFields', ['secret']);
//Molecule.helper('collections.comments.forbiddenFields', ['publisher', 'entryId', 'submitted']);
