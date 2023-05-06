import * as hbs from 'hbs';

export function registerHelpers() {
  hbs.registerHelper(
    'compare',
    function (id: number, otherId: number, options: any) {
      if (id == otherId) {
        return options.fn(this);
      } else {
        return options.inverse(this);
      }
    },
  );

  hbs.registerHelper('formatDate', function (dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const diffInMinutes = Math.round(diff / (1000 * 60));
    const diffInHours = Math.round(diff / (1000 * 60 * 60));
    const diffInDays = Math.round(diff / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 60) {
      return `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInDays < 7) {
      const options: object = {
        weekday: 'long',
        hour: '2-digit',
        minute: '2-digit',
      };
      return date.toLocaleDateString('en-US', options);
    } else {
      const diffInWeeks = Math.round(diffInDays / 7);
      return `${diffInWeeks} weeks ago`;
    }
  });

  hbs.registerHelper(
    'lastMessage',
    function (conversationId, lastMessages, options) {
      let result = '';
      lastMessages.forEach(function (lastMessage) {
        if (lastMessage && lastMessage.conversation === conversationId) {
          result = options.fn(lastMessage);
        }
      });
      return result;
    },
  );

  hbs.registerHelper('groupData', function (data, options) {
    if (!data) {
      return;
    }
    data.sort((a: any, b: any) => {
      let nameA = a.user1 ? a.user1.fullName : a.user2.fullName;
      let nameB = b.user1 ? b.user1.fullName : b.user2.fullName;
      return nameA.localeCompare(nameB);
    });

    let groupedData = {};

    for (let item of data) {
      let name = item.user1 ? item.user1.fullName : item.user2.fullName;
      let firstLetter = name.charAt(0).toUpperCase();
      if (!groupedData[firstLetter]) {
        groupedData[firstLetter] = [];
      }
      groupedData[firstLetter].push(item);
    }

    let result = '';

    for (let key in groupedData) {
      result += options.fn({ key: key, items: groupedData[key] });
    }

    return result;
  });

  hbs.registerHelper('groupParticipants', function (data, options) {
    if (!data) {
      return;
    }
    data.sort((a: any, b: any) => {
      let nameA = a.fullName;
      let nameB = b.fullName;
      return nameA.localeCompare(nameB);
    });

    let groupedData = {};

    for (let item of data) {
      let name = item.fullName;
      let firstLetter = name.charAt(0).toUpperCase();
      if (!groupedData[firstLetter]) {
        groupedData[firstLetter] = [];
      }
      groupedData[firstLetter].push(item);
    }

    let result = '';

    for (let key in groupedData) {
      result += options.fn({ key: key, items: groupedData[key] });
    }

    return result;
  });
}
