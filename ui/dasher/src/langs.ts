import { h } from 'snabbdom'
import { VNode } from 'snabbdom/vnode'

import { Redraw, Close, spinner, bind, header } from './util'
import { get } from './xhr'

export interface Lang {
  0: Code,
  1: string
}

type Code = string;

export interface LangsData {
  current: Code
  accepted: Code[]
}

export interface LangsCtrl {
  data: LangsData
  list(): Lang[] | undefined
  load(): void
  close: Close
}

export function ctrl(data: LangsData, redraw: Redraw, close: Close): LangsCtrl {

  let list: Lang[] | undefined;

  return {
    data,
    list: () => list,
    load() {
      get(window.lichess.assetUrl('/assets/trans/refs.json'), true).then(d => {
        const accs: Lang[] = [];
        const others: Lang[] = [];
        d.forEach((l: Lang) => {
          if (data.accepted.indexOf(l[0]) > -1) accs.push(l);
          else others.push(l);
        });
        list = accs.concat(others) as Lang[];
        redraw();
      });
    },
    close
  };
}

export function view(ctrl: LangsCtrl): VNode {

  const list = ctrl.list();
  if (!list) ctrl.load();

  return h('div.sub.langs', [
    header('Language', ctrl.close),
    list ? h('form', {
      attrs: { method: 'post', action: '/translation/select' }
    }, langLinks(ctrl, list)) : spinner()
  ]);
}

function langLinks(ctrl: LangsCtrl, list: Lang[]) {
  const links = list.map(langView(ctrl.data.current, ctrl.data.accepted));
  links.push(h('a', {
    attrs: { href: '/translation/contribute' }
  }, 'Help translate lichess'));
  return links;
}

function langView(current: Code, accepted: Code[]) {
  return (l: Lang) =>
  h('button' + (current === l[0] ? '.current' : '') + (accepted.indexOf(l[0]) > -1 ? '.accepted' : ''), {
    attrs: {
      type: 'submit',
      name: 'lang',
      value: l[0]
    },
  }, l[1]);
}