import * as browser from './browser';
import * as dom from './dom';
import * as extension from './extension';
import * as storage from './storage';
import * as timing from './timing';

export default {
  ...browser,
  ...dom,
  ...extension,
  ...storage,
  ...timing,
};
