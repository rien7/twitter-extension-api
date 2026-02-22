import { afterEach, describe, expect, it, vi } from 'vitest';

import { removeFollower } from '../api/action/remove-follower';
import { likes } from '../api/query/likes';
import { __resetSelfUserIdForTests } from '../src/sdk/self-user-id';

describe('callable api metadata fields', () => {
  afterEach(() => {
    __resetSelfUserIdForTests();
    vi.unstubAllGlobals();
  });

  it('prints __desc text via console.log when __desc is accessed', () => {
    const logSpy = vi.spyOn(console, 'log').mockImplementation(() => {
      // noop
    });

    const desc = likes.__desc;

    expect(typeof desc).toBe('string');
    expect(desc).toContain('Input:');
    expect(logSpy).toHaveBeenCalledWith(desc);
  });

  it('fills userId-like default params with self id parsed from twid', () => {
    vi.stubGlobal('document', {
      cookie: 'twid=u%3D42'
    });

    const defaults = likes.__default_params as {
      variables?: {
        userId?: string;
      };
    };

    expect(defaults.variables?.userId).toBe('42');

    const actionDefaults = removeFollower.__default_params as {
      variables?: {
        target_user_id?: string;
      };
    };
    expect(actionDefaults.variables?.target_user_id).toBe('42');
  });
});
