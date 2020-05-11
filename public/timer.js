import { app, h } from 'https://unpkg.com/hyperapp?module=1';
import * as actions from '/actions.js';
import * as subscriptions from '/subscriptions.js';
import Status from '/status.js';

import { card } from '/components/card.js';
import { fullButton } from '/components/fullButton.js';
import { section } from '/components/section.js';
import { tab } from '/components/tab.js';
import { settings } from '/components/settings.js';

import { header } from '/sections/header.js';
import { timeRemaining } from '/sections/timeRemaining.js';

import { goalList } from '/sections/goalList.js';
import { addGoal } from '/sections/addGoal.js';

import { mobParticipants } from '/sections/mobParticipants.js';
import { addParticipant } from '/sections/addParticipant.js';
import { mobActions } from '/sections/mobActions.js';

import { setLength } from '/sections/setLength.js';

import { qrShare } from '/sections/qrShare.js';

const [initialTimerId] = window.location.pathname.split('/').filter(Boolean);

const getGoalsDetails = ({ goals }) => {
  const total = goals.length;

  if (total === 0) {
    return 'None';
  }

  const completed = goals.filter((g) => g.completed).length;

  return `${completed} / ${total}`;
};

app({
  init: actions.Init(null, initialTimerId),

  view: (state) => h('div', {
    class: {
      'flex': true,
      'items-start': true,
      'justify-center': true,
    },
  }, h(card, {
    class: {
      'min-h-screen': true,
      'sm:min-h-0': true,
      'w-full': true,
      'sm:w-8/12': true,
      'lg:w-6/12': true,
      'xl:w-4/12': true,
      'shadow': false,
      'sm:shadow-lg': true,
      'pt-2': false,
      'pt-0': true,
      'pb-12': true,
      'pb-1': false,
      'sm:mt-2': true,
      'rounded': false,
      'sm:rounded': true,
      'bg-indigo-600': true,
      'text-white': true,
    },
  }, [
    h(header),

    h(timeRemaining, {
      remainingTime: state.remainingTime,
      serverState: state.serverState,
    }),

    h('div', {
      class: {
        'grid': true,
        'grid-cols-2': true,
        'sm:grid-cols-4': true,
        'gap-1': true,
        'px-2': true,
        'py-4': true,
        'sm:px-4': true,
      },
    }, [
      h(tab, {
        selected: state.timerTab === 'mob',
        onclick: [actions.SetTimerTab, 'mob'],
      }, 'Mob'),
      h(tab, {
        selected: state.timerTab === 'goals',
        onclick: [actions.SetTimerTab, 'goals'],
        details: getGoalsDetails(state.serverState),
      }, 'Goals'),
      h(tab, {
        selected: state.timerTab === 'settings',
        onclick: [actions.SetTimerTab, 'settings'],
      }, 'Settings'),
      h(tab, {
        selected: state.timerTab === 'share',
        onclick: [actions.SetTimerTab, 'share'],
      }, 'Share'),
    ]),

    state.timerTab === 'mob' && [
      h(mobParticipants, {
        drag: state.drag.type === 'mob' ? state.drag : {},
        mob: state.serverState.mob,
      }),

      h(addParticipant, {
        name: state.name,
      }),

      h(mobActions),
    ],

    state.timerTab === 'goals' && [
      h(goalList, {
        drag: state.drag.type === 'goal' ? state.drag : {},
        goals: state.serverState.goals,
      }),
      h(addGoal, {
        goal: state.goal,
      }),
    ],

    state.timerTab === 'settings' && h(settings, {}, [
      h(setLength, {
        timeInMinutes: state.timeInMinutes,
      }),
    ]),

    state.timerTab === 'share' && [
      h(qrShare),
    ],

    h(section, {
      class: {
        'w-full': true,
        ...Status.caseOf({
          Connecting: () => ({ 'bg-transparent': true, 'text-gray-400': true }),
          Connected: () => ({ 'bg-transparent': true, 'text-gray-400': true }),
          Reconnecting: () => ({ 'bg-transparent': true, 'text-gray-400': true }),
          Error: () => ({ 'bg-red-500': true, 'text-white': true }),
        }, state.status),
        'text-center': true,
        'text-xs': true,
      },
    },
      Status.caseOf({
        Connecting: () => 'Websocket connecting',
        Connected: () => `Websocket connected, with ${state.serverState.connections - 1} other(s)`,
        Reconnecting: () => 'Websocket reconnecting',
        Error: (err) => `Error: ${err}`
      }, state.status),
    ),

    h(fullButton, {
      onclick: actions.RequestNotificationPermission,
      class: {
        'hidden': !(!state.allowNotification && ('Notification' in window)),
        'bg-green-500': true,
        'hover:bg-green-700': true,
        'uppercase': true,
        'font-light': true,
        'tracking-widest': true,
        'rounded-tr-lg': true,
        'py-1': true,
      },
    }, 'Enable Notifications'),
  ])),

  subscriptions: (state) => {
    const { timerId, drag } = state;

    return [
      timerId && subscriptions.Websocket({
        actions,
        timerId,
      }),

      Status.caseOf({
        Connected: (token) => subscriptions.KeepAlive({ token }),
        Connecting: () => false,
        Reconnecting: () => false,
        Error: () => false,
      }, state.status),

      subscriptions.Timer({
        timerStartedAt: state.serverState.timerStartedAt,
        timerDuration: state.serverState.timerDuration,
        actions,
      }),

      drag.type && subscriptions.DragAndDrop({
        active: drag.active,
        DragMove: actions.DragMove,
        DragEnd: actions.DragEnd,
        DragCancel: actions.DragCancel,
      }),
    ];
  },

  node: document.querySelector('#app'),
});