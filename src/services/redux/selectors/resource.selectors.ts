import maybe from '@hansogj/maybe';
import { createSelector } from 'reselect';
import { User } from '../../../domain';
import { getUser } from './app.selectors';
import { getSelectedFields } from './folders.selectors';

const fromUser = (prop: keyof User) =>
  createSelector(getUser, (user) => maybe(user).mapTo(prop).valueOr(undefined));

export const getFoldersResource = fromUser('collection_folders_url');
export const getFieldsResource = fromUser('collection_fields_url');
export const getInventoryResource = fromUser('inventory_url');
export const getWantListResource = fromUser('wantlist_url');
export const getAddReleaseToFolderResource = (release_id: number) =>
  createSelector(getFoldersResource, getSelectedFields, (folderResource, { folders }) =>
    [folderResource, folders, 'releases', release_id].join('/'),
  );

export const getAllFoldersReleasesResource = createSelector(getFoldersResource, (folderResource) =>
  [folderResource, 0, 'releases'].join('/'),
);

export type ResourceSelectors = typeof getFieldsResource;
