const BASE_URL = "https://movie-list.alphacamp.io";
const INDEX_URL = BASE_URL + "/api/v1/movies/";
const POSTER_URL = BASE_URL + "/posters/";
const MOVIES_PER_PAGE = 12;
// Initial modal as a spinner
const modalInitial = `
  <div class="d-flex justify-content-center align-items-center" style="height: 50vh">
    <div class="spinner-border" role="status">
      <span class="visually-hidden">Loading...</span>
    </div>
  </div>
  `;

const movies = [];
let filteredMovies = [];

const dataPanel = document.querySelector("#data-panel");
const searchForm = document.querySelector("#search-form");
const searchInput = document.querySelector("#search-input");
const movieModal = document.querySelector("#movie-modal");
const paginator = document.querySelector("#paginator");
const switchPannel = document.querySelector("#switch-pannel");

axios
  .get(INDEX_URL)
  .then((response) => {
    movies.push(...response.data.results);
    renderPaginator(movies.length);
    renderMovieList(getMoviesByPage());
  })
  .catch((err) => console.log(err));

// ----Event Listener---

dataPanel.addEventListener("click", onPanelClicked);
searchForm.addEventListener("input", searchMovie);
paginator.addEventListener("click", onPaginatorSubmit);
switchPannel.addEventListener("click", switchShowMode);

// ------function------
function renderMovieList(data) {
  // Render page by last choose show mode
  const showMode = localStorage.getItem("Show_mode") || "cards";
  document.querySelector(`#switch-${showMode}`).classList.add("switch-active");
  if (showMode === "cards") {
    renderMovieListAsCards(data);
  } else if (showMode === "list") {
    renderMovieListAsList(data);
  }
}

function renderMovieListAsCards(data) {
  let rawHTML = data.reduce(
    (pdata, cdata) =>
      pdata +
      `
        <div class="col-md-3 gy-4">
          <div class="card h-100">
            <img src=${POSTER_URL + cdata.image
      } class="card-img-top" alt="Movie Poster" />
            <div class="card-body">
              <h5 class="card-title">${cdata.title}</h5>
            </div>
            <div class="card-footer text-end">
              <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${cdata.id
      }">More</button>
              <button class="btn btn-info btn-add-favorite" data-id="${cdata.id
      }">+</button>
              </div>
            </div>
        </div>
      `,
    ""
  );
  dataPanel.innerHTML = rawHTML;
}

function renderMovieListAsList(data) {
  let rawHTML = data.reduce(
    (pdata, cdata) =>
      pdata +
      `
      <li class="list-group-item">
        <div class="row">
          <div class ="col-8">
            ${cdata.title}
          </div>
          <div class ="col">
            <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${cdata.id}">
                More
            </button>
            <button class="btn btn-info btn-add-favorite" data-id="${cdata.id}">
              +
            </button>
          </div>
        </div>
      </li>
      `,
    `<ul class="list-group list-group-flush">`
  );
  rawHTML += "</ul>";
  dataPanel.innerHTML = rawHTML;
}

function renderPaginator(amount) {
  const numOfPage = Math.ceil(amount / MOVIES_PER_PAGE);
  let rawHTML = "";
  for (let page = 1; page <= numOfPage; page++) {
    rawHTML += `<li id="page-${page}" class="page-item"><a class="page-link" href="#" data-page=${page}>${page}</a></li>`;
  }
  paginator.innerHTML = rawHTML;
}

function onPaginatorSubmit(e) {
  if (e.target.tagName !== "A") return;
  const page = Number(e.target.innerText);
  // Store page in localStorage and goto page
  localStorage.setItem("Page", page);
  renderMovieList(getMoviesByPage());
}

function getMoviesByPage() {
  // movies or filteredMovies
  const page = Number(localStorage.getItem("Page")) || 1;
  if (document.querySelector(".active")) {
    document.querySelector(".active").classList.remove("active");
  }
  document.querySelector(`#page-${page}`).classList.add("active");
  const data = filteredMovies.length ? filteredMovies : movies;
  const startIndex = (page - 1) * MOVIES_PER_PAGE;
  return data.slice(startIndex, startIndex + MOVIES_PER_PAGE);
}

function onPanelClicked(e) {
  if (e.target.matches(".btn-show-movie")) {
    showMovieModal(Number(e.target.dataset.id));
  } else if (e.target.matches(".btn-add-favorite")) {
    addToFavorite(Number(e.target.dataset.id));
  }
}

function searchMovie(e) {
  e.preventDefault();
  const keyword = searchInput.value.toLowerCase();
  filteredMovies = movies.filter((movie) =>
    movie.title.toLowerCase().includes(keyword)
  );
  if (filteredMovies.length === 0) {
    alert("Cannot find movies with keyword: ", keyword);
    // if alert, delete last input charactor
    searchInput.value = keyword.slice(0, -1);
    return;
  }
  // After search, render page 1
  localStorage.setItem("Page", 1);
  renderPaginator(filteredMovies.length);
  renderMovieList(getMoviesByPage());
}

function showMovieModal(id) {
  movieModal.innerHTML = modalInitial;
  axios
    .get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results;
      movieModal.innerHTML = `
        <div class="modal-dialog modal-xl">
          <div class="modal-content">
            <div class="modal-header px-4">
              <!-- Title -->
              <h3 class="modal-title" id="movie-modal-title">${data.title}</h3>
              <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
              </button>
            </div>
            <div class="modal-body" id="movie-modal-body">
              <div class="row justify-content-center">
                <!-- Img src -->
                <div class="col-lg text-center" id="movie-modal-image">
                  <img
                    src=${POSTER_URL + data.image}
                    alt="movie-poster" class="img-fluid">
                </div>
                <div class="col-lg fs-5">
                  <!-- Release date -->
                  <p><em id="movie-modal-date">release date: ${data.release_date
        }</em></p>
                  <!-- description -->
                  <p id="movie-modal-description">${data.description}</p>
                </div>
              </div>
            </div>
            <div class="modal-footer">
            </div>
          </div>
        </div>
          
      `;
    })
    .catch((err) => console.log(err));
}

function addToFavorite(id) {
  const list = JSON.parse(localStorage.getItem("favoriteMovies")) || [];
  const movie = movies.find((movie) => movie.id === id);
  if (list.some((movie) => movie.id === id)) {
    return alert("Already in favorite list");
  }
  list.push(movie);
  localStorage.setItem("favoriteMovies", JSON.stringify(list));
}

function switchShowMode(e) {
  if (e.target.tagName !== "I") return;

  // Get the current page and set showmode
  const showMode = e.target.id.split("-")[1];
  if (showMode === localStorage.getItem("Show_mode")) return;
  localStorage.setItem("Show_mode", showMode);
  document.querySelector(".switch-active").classList.remove("switch-active");
  e.target.classList.add("switch-active");
  renderMovieList(getMoviesByPage());
}
