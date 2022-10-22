
// Constant
const BASE_URL = "https://lighthouse-user-api.herokuapp.com/";
const INDEX_URL = BASE_URL + "api/v1/users/";
// Modal While Loading Data
const MODAL_LOADING = `
  <div class="modal-header">    
  </div>
  <div class="modal-body py-4">
    <div class="container">
      <div class="row align-items-center">
        <div class="col-lg d-flex justify-content-center align-items-center mb-3">
          <div class="d-flex justify-content-center align-items-center modal-spinner-box rounded">
            <div class="spinner-border" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
          </div>
        </div>
        <div class="col-lg">
          <table class="table">
            <tbody>
              <tr>
                <th scope="row">Name</th>
                <td>...</td>
              </tr>
              <tr>
                <th scope="row">Gender</th>
                <td>...</td>
              </tr>
              <tr>
                <th scope="row">Age</th>
                <td>...</td>
              </tr>
              <tr>
                <th scope="row">Region</th>
                <td>...</td>
              </tr>
              <tr>
                <th scope="row">Birthday</th>
                <td>...</td>
              </tr>
              <tr>
                <th scope="row">Email</th>
                <td>...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
  <div class="modal-footer">              
  </div>
`

// Node
const dataPanel = document.querySelector("#data-panel");
const searchBarInput = document.querySelector("#search-bar-input");
const modal = document.querySelector(".modal-content");
const pagination = document.querySelector("#pagination");
const dropdownDisplay = document.querySelector('#dropdown-display');

// array
const members = [];
let filterMembers = [];
let filterMembersByName = [];

// object
const intervals = { 'age': 10 } // Store age interval
const filters = {} // Store filters
const filtersWithInterval = {} // Store filters (with interval)
let filterName = ""

// Var
let dataPerPage = 12; // Could design a button to change data per page

// Start render index.html
renderIndex(INDEX_URL)

// -------EventListener----

dataPanel.addEventListener("click", displayModal)
pagination.addEventListener("click", goToPage)
searchBarInput.addEventListener("input", nameFilterInput)
dropdownDisplay.addEventListener('click', filtersInput)

// -------functions--------

function renderIndex(INDEX_URL) {
  axios
    .get(INDEX_URL)
    .then(function (response) {
      members.push(...response.data.results);
      renderPage(members, 1)
      createDropdown('region', classification(members, 'region'))
      createDropdown('gender', classification(members, 'gender'))
      createDropdown('age', classification(members, 'age', intervals['age']), intervals['age'])
    })
    .catch(function (error) {
      // handle error
      console.log(error);
    });
}

// render page
function renderPage(data, page) {
  displayMembers(getDataByPage(page, filteredData(data)))
  displayPagination(filteredData(data))
}

// display members
function displayMembers(data, node = dataPanel) {
  displayMembersCards(dataPerPage)
  if (data.length === 0) {
    displayNoResult()
    return
  }
  const rawHTML = data.reduce((previousMember, currentMember) =>
    previousMember + `
      <div class="col my-3">
        <div data-id="${currentMember.id}" class="card show-member" style="width: 16rem;" data-bs-toggle="modal" data-bs-target="#memberModal" class="card-img-top btn show-member">
          <img src="${currentMember.avatar}" class="card-img-top">          
          <div class="card-body d-flex flex-column">
            <h6 class="card-title my-2 text-center fw-bold color-${currentMember.gender}">${currentMember.name} ${currentMember.surname}</h6>
            <h6 class="card-title text-center">${currentMember.region}</h6>
            <h6 class="card-title text-center" style="font-size: 14px;">${currentMember.age} y</h6>
          </div>
        </div>
      </div>
      `, '',)
  node.innerHTML = rawHTML
}

// display empty cards before reder members data
function displayMembersCards(dataPerPage, node = dataPanel) {
  node.innerHTML = ""
  const rawHTML = `
        <div class="col my-3">
          <div class="card" style="width: 16rem;">
            <div class="col-lg d-flex justify-content-center align-items-center mb-3 card-spinner-box">
              <div class="d-flex justify-content-center align-items-center spinner-box rounded">
                <div class="spinner-border" role="status">
                  <span class="visually-hidden">Loading...</span>
                </div>
              </div>
            </div>
            <div class="card-body d-flex flex-column">
              <h6 class="card-title my-2 text-center fw-bold">...</h6>
              <h6 class="card-title text-center">...</h6>
              <h6 class="card-title text-center" style="font-size: 14px;">...</h6>
            </div>
          </div>
        </div>
      `.repeat(dataPerPage)
  node.innerHTML = rawHTML
}

function filteredData(data) {
  if (filters.length === 0 && filtersWithInterval.length === 0 && filterName === "") return data
  // filter
  filterMembers = members
  // filters
  Object.entries(filters).forEach((obj) => { // the obj[0] is a classType, obj[1] is one class of the classType
    filterMembers = filterMembers.filter(item => item[obj[0]] === obj[1])
  })
  // filters with interval
  Object.entries(filtersWithInterval).forEach((obj) => {// the obj[0] is a classType, obj[1] is one class of the classType
    filterMembers = filterMembers.filter(item => Number(item[obj[0]]) >= Number(obj[1]) && Number(item[obj[0]]) < (Number(obj[1]) + Number(intervals[obj[0]])))
  })
  // filter name
  filterMembers = filterMembers.filter(member => (member.name + member.surname).toLowerCase().includes(filterName))
  return filterMembers
}

function displayNoResult() {
  dataPanel.innerHTML = `<div class="container-fluid text-center my-5"><div>No result</div></div>`
  pagination.innerHTML = ""
}

// display modal
function displayModal(e) {
  if (e.target.parentNode.matches(".show-member")) {
    modal.innerHTML = MODAL_LOADING
    axios.get(INDEX_URL + e.target.parentNode.dataset.id)
      .then(function (response) {
        modal.innerHTML = `
            <div class="modal-header">
              <h5 class="modal-title"></h5>
            </div>
            <div class="modal-body py-4">
              <div class="container">
                <div class="row align-items-center">
                  <div class="col-lg text-center mb-3">
                    <img src="${response.data.avatar}" class="mx-auto rounded">
                  </div>
                  <div class="col-lg">
                    <table class="table">
                      <tbody>
                        <tr>
                          <th scope="row">Name</th>
                          <td>${response.data.name} ${response.data.surname}</td>
                        </tr>
                        <tr>
                          <th scope="row">Gender</th>
                          <td>${response.data.gender}</td>
                        </tr>
                        <tr>
                          <th scope="row">Age</th>
                          <td>${response.data.age}</td>
                        </tr>
                        <tr>
                          <th scope="row">Region</th>
                          <td>${response.data.region}</td>
                        </tr>
                        <tr>
                          <th scope="row">Birthday</th>
                          <td>${response.data.birthday}</td>
                        </tr>
                        <tr>
                          <th scope="row">Email</th>
                          <td>${response.data.email}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
              
            </div>
            <div class="modal-footer">              
            </div>
        `;
      })
      .catch(function (error) {
        console.log(error);
      });
  }
}

// Return a list of classes
function classification(members, classType, interval) {
  let allClass = members.map((member) => member[classType])
  allClass = [...new Set(allClass)].sort()
  if (interval) {
    let intervalAllClass = allClass.map(item => Math.floor(item / interval) * interval)
    return [...new Set(intervalAllClass)]
  }
  return allClass
}

function createDropdown(classType, data, interval, node = dropdownDisplay) {
  let dataDropdownMenuRegion = ''
  if (interval) {
    dataDropdownMenuRegion = data.reduce((previousData, currentData) =>
      previousData + `
      <li><a id="${classType}-${currentData}-${interval}" class="dropdown-item" href="#">${currentData} - ${currentData + interval - 1}</a></li>
      `, "",)
  }
  else {
    dataDropdownMenuRegion = data.reduce((previousData, currentData) =>
      previousData + `
      <li><a id="${classType}-${currentData}" class="dropdown-item" href="#">${currentData.toUpperCase()}</a></li>
  `, "",)
  }
  node.innerHTML += `
  <li class="nav-item dropdown">
    <a class="nav-link dropdown-toggle filter-${classType}" href="#" role="button" data-bs-toggle="dropdown" aria-expanded="false">${classType.toUpperCase()}</a>
    <ul class="dropdown-menu">
      ${dataDropdownMenuRegion}
      <li><hr class="dropdown-divider"></li>
      <li><a id="${classType}-all" class="dropdown-item" href="#">All</a></li>
    </ul>
  </li>
  `
}

// click dropdown >> input filter
function filtersInput(e) {
  if (!e.target.id) return;
  // Clear name search key
  searchBarInput.value = ''
  const searchKeys = e.target.id.split('-')
  // if click all, delete the filter
  if (searchKeys[1] === 'all') {
    delete filters[searchKeys[0]]
    delete filtersWithInterval[searchKeys[0]]
    document.querySelector(`.filter-${searchKeys[0]}`).innerText = searchKeys[0].toUpperCase()
  } else {
    // if with interval
    if (searchKeys[2]) {
      filtersWithInterval[searchKeys[0]] = searchKeys[1]
      document.querySelector(`.filter-${searchKeys[0]}`).innerText = `${searchKeys[1]} - ${Number(searchKeys[1]) + Number(searchKeys[2]) - 1}`
    } else { //if without interval
      filters[searchKeys[0]] = searchKeys[1]
      document.querySelector(`.filter-${searchKeys[0]}`).innerText = searchKeys[1].toUpperCase()
    }
  }
  renderPage(members, 1)
}

// name
function nameFilterInput() {
  filterName = searchBarInput.value.trim().toLowerCase()
  renderPage(members, 1)
}

// display pagination
function displayPagination(data, node = pagination) {
  const numberOfPages = Math.ceil(data.length / dataPerPage)
  let rawHTML = ''
  for (let page = 1; page <= numberOfPages; page++) {
    rawHTML += `<li class="page-item"><a class="page-link" href="#" data-page="${page}">${page}</a></li>`
  }
  node.innerHTML = rawHTML
}

// get the data of the page
function getDataByPage(page, data) {
  console.log(data)
  return data.slice((page - 1) * dataPerPage, (page) * dataPerPage)
}

// go to the page
function goToPage(e) {
  if (e.target.tagName !== 'A') return
  const page = Number(e.target.dataset.page)
  renderPage(members, page)
}