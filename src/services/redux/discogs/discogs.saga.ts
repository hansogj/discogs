import '@hansogj/array.utils';
import {
  all,
  call,
  CallEffect,
  put,
  PutEffect,
  select,
  SelectEffect,
  takeLatest,
} from 'redux-saga/effects';
import { Artist, Release } from '../../../domain';
import * as api from '../../api';
import { AppActions, DISCOGS_BASE_URL } from '../app';
import * as appActions from '../app/app.actions';
import { getPathToWindowResource } from '../selectors';
import {
  getFieldsResource,
  getFoldersResource,
  getInventoryResource,
  ResourceSelectors,
} from '../selectors/resource.selectors';
import * as actions from './discogs.actions';

export function* fetchResource<T>(
  selector: ResourceSelectors,
  body?: SearchParams,
): Generator<SelectEffect | CallEffect | PutEffect, T, T> {
  let result: T = undefined as unknown as T;
  try {
    const resource = yield select(selector);
    if (resource) {
      result = yield call(api.fetch as any, resource, body);
    } else {
      yield put(appActions.getUser());
    }
  } catch (error) {
    yield put(appActions.warn({ error: error as Error }));
  }
  return result;
}

function* getResourceIdFromWindowUrl() {
  try {
    let path: string = yield select(getPathToWindowResource);

    if (/artists/.test(`${path}`)) {
      const artist: Artist = yield call(api.fetch, `${DISCOGS_BASE_URL}/${path}`);
      yield put(actions.getArtistLoadedSuccess(artist));
    }

    if (/(masters)|(releases)/.test(`${path}`)) {
      const release: Release.DTO = yield call(api.fetch, `${DISCOGS_BASE_URL}/${path}`);
      const releaseId = (release as Release.DTO).id;
      if (release.master_url) {
        let master: Release.MasterReleaseDTO = yield call(api.fetch, release.master_url);
        yield put(actions.releasePageItemLoaded({ releaseId, master }));
      } else {
        yield put(
          actions.releasePageItemLoaded({
            releaseId,
            master: release as unknown as Release.MasterReleaseDTO,
          }),
        );
      }
    }
  } catch (error) {
    console.log(error);
  }
}

// eslint-disable-next-line
function* getDiscogsInventory() {
  yield fetchResource(getInventoryResource);
  yield fetchResource(getFoldersResource);
  yield fetchResource(getFieldsResource);
}

function* DiscogsSaga() {
  yield all([takeLatest(AppActions.windowUrlRetrieved, getResourceIdFromWindowUrl)]);
}

export default DiscogsSaga;
