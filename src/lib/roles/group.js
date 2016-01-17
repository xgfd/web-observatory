/**
 * Created by xgfd on 24/12/2015.
 */

let Molecule = new Roles.Role('group'),
    grants = {
        entries: [function access(entry) {
            return accessesDocument(this.userId, entry);
        }],
        groups: ['index', 'update', 'showUpdate'],
        datasets: ['index', 'insert', 'update', 'remove', 'showCreate', 'showUpdate', 'showRemove'],
        apps: ['index', 'insert', 'update', 'remove', 'showCreate', 'showUpdate', 'showRemove']
    };

setCollectionGrants(Molecule, grants);

Molecule.helper('collections.groups.indexFilter', ownsDocumentQuery);
Molecule.helper('collections.datasets.indexFilter', ownsDocumentQuery);
Molecule.helper('collections.apps.indexFilter', ownsDocumentQuery);


