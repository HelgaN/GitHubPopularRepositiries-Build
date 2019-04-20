(function () {
  'use strict';

  class GitHubService {
    constructor() {
      this._apiBase = `https://api.github.com/search/repositories?q=`;
      this.stars = 50000;
    }

    async getResourse(url) {
      const resp = await fetch(`${this._apiBase}${url}&per_page=100`);

      if(!resp.ok) {
        throw new Error(`Could not fetch ${url}`, `received ${url.status}`);
      }

      return await resp.json();
    }

    async getPopularRepositories() {
      const query = await this.getResourse(`stars:>=${this.stars}`);
      return query;
    }
  }

  const itemTemplate = (item) => {
    return `
    <tr class="table-light">
      <td><img class="avatar" src="${item.owner.avatar_url}"></td>
      <td>${item.name}</td>
      <td>${item.owner.login}</td>
      <td>${item.stargazers_count}</td>
      <td>${item.language !== null ? item.language : "content"}</td>
      <td>${item.updated_at.slice(0, 10)} ${item.updated_at.slice(11, -1)}</td>
      <td colspan="2">
        <a class="table-link" href="${item.svn_url}">${item.svn_url}</a>
      </td>
    </tr>
  `;
  };

  const itemFilterTemplate = (item) => {
    return `<a class="dropdown-item" href="#">${item}</a>`
  };

  const createUniqueList = (array) => Array.from(new Set(array));

  const sortByOldest = (data) => {
    let dataSort = [...data].sort(function compareAge(item1, item2) {
      const date1 = new Date(item1.updated_at);
      const date2 = new Date(item2.updated_at);
      return date1 - date2;
    });
    return dataSort;
  };

  const sortByNewest = (data) => {
    let dataSort = [...data].sort(function compareAge(item1, item2) {
      const date1 = new Date(item1.updated_at);
      const date2 = new Date(item2.updated_at);
      return date2 - date1;
    });
    return dataSort;
  };

  const searchActiveEl = (wrapper) => {
    return wrapper.querySelector(".active");
  };

  const removePreloader = (className) => {
    document.querySelector(`.${className}`).style.backgroundImage = "none";
  };

  class App {
    constructor() {
      this.repsList = document.getElementById("reps-list");
      this.langList = document.getElementById("lang");
      this.updateList = document.getElementById("update");
      this.reset = document.querySelector(".btn-reset");
    }

    createRepList(data) {
      let list = data.items.map((item) => itemTemplate(item));
      this.repsList.innerHTML = list.join("");
    }

    createLangList(data) {
      let langArray = [];
      data.forEach((item) => langArray.push(item.language !== null ? item.language : "content"));
      const uniqueLangList = createUniqueList(langArray);

      let list = uniqueLangList.map((item) => itemFilterTemplate(item));
      list.push(itemFilterTemplate("all"));
      this.langList.innerHTML += list.join("");
    }

    creatUpdateList(data) {
      const list = data.map((item) => itemFilterTemplate(item));    this.updateList.innerHTML += list.join("");
    }

    initializeEvents(data) {
      this.langList.addEventListener("click", (evt) => {
        evt.preventDefault();
        const langLinks = lang.querySelectorAll(".dropdown-item");
        langLinks.forEach((link) => link.classList.remove("active"));
        evt.target.classList.add("active");
        let filterName = evt.target.innerText;
        if(evt.target.innerText === "content") {
          filterName = null;
        }

        let dataFilter;

        filterName !== "all"
        ? dataFilter = {
          items: data.filter(item => item.language == filterName)
        } : dataFilter = {
          items: data
        };

        const activeUpdate = searchActiveEl(this.updateList) || undefined;

        if(activeUpdate) {
          activeUpdate.innerText === "newest" ? dataFilter.items = sortByNewest(dataFilter.items) : null;
          activeUpdate.innerText === "oldest" ? dataFilter.items = sortByOldest(dataFilter.items) : null;
        }
        this.createRepList(dataFilter);
      });

      this.updateList.addEventListener("click", (evt) => {
        evt.preventDefault();
        const updateLinks = update.querySelectorAll(".dropdown-item");
        updateLinks.forEach((link) => link.classList.remove("active"));
        evt.target.classList.add("active");
        let filterName = evt.target.innerText;

        let sortData = {};
        filterName === "newest" ? sortData.items = sortByNewest([...data]) : sortData.items = sortByOldest([...data]);
        const activeLang = searchActiveEl(this.langList) || "all";

        if(activeLang.innerHTML !== "all" && activeLang.innerHTML !== undefined) {
          let sortDataByLang = [];
          sortData.items.forEach((item) => {
            if(item.language === activeLang.innerText || item.language === null && activeLang.innerHTML === "content") {
              sortDataByLang.push(item);
            }
          });
          sortData.items = sortDataByLang;
        }

        this.createRepList(sortData);
      });

      this.reset.addEventListener("click", () => {
        const allItems = {
          items: data
        };
        this.createRepList(allItems);
      });
    };

    init(data) {
      this.createRepList(data);
      this.createLangList(data.items);
      this.creatUpdateList(["newest", "oldest"]);
      this.initializeEvents(data.items);
      removePreloader("jumbotron");
    }
  }


  const runApp = async () => {
    try {
      const Service = new GitHubService();
      const app = new App();
      const data = await Service.getPopularRepositories();
      app.init(data);
    } catch(error) {
      console.error(`APPLICATION ERROR! ${error}`);
    }
  };

  runApp();

}());

//# sourceMappingURL=index.js.map
