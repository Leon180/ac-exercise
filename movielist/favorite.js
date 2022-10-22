const BASE_URL = 'http://movie-list.alphacamp.io'
const INDEX_URL = BASE_URL + '/api/v1/movies/'
const POSTER_URL = BASE_URL + '/posters/'

const movies = JSON.parse(localStorage.getItem('favoriteMovies'))

const dataPanel = document.querySelector('#data-panel')

renderMovieList(movies)

const modalContent = document.querySelector('.modal-content')
dataPanel.addEventListener('click', function onPanelClicked(e) {
  if (e.target.matches('.btn-show-movie')) {
    showMovieModal(Number(e.target.dataset.id))
  } else if (e.target.matches('.btn-remove-favorite')) {
    removeFavorite(Number(e.target.dataset.id))
  }
})


localStorage.setItem('default_language', 'English')

// function

function renderMovieList(data) {
  let rawHTML = ''
  data.forEach((item) => {
    rawHTML += `
        <div class="col-sm-3">
          <div class="mb-2">
            <div class="card">
              <img
                src=${POSTER_URL + item.image}
                class="card-img-top" alt="Movie Poster" />
              <div class="card-body">
                <h5 class="card-title">${item.title}</h5>
              </div>
              <div class="card-footer">
                <button class="btn btn-primary btn-show-movie" data-bs-toggle="modal"
                data-bs-target="#movie-modal" data-id="${item.id}">More</button>
                <button class="btn btn-danger btn-remove-favorite" data-id="${item.id}">X</button>
              </div>
            </div>
          </div>
        </div>
      `
  })
  dataPanel.innerHTML = rawHTML
}

function showMovieModal(id) {
  const modalTitle = document.querySelector('#movie-modal-title')
  const modalImage = document.querySelector('#movie-modal-image')
  const modalDate = document.querySelector('#movie-modal-date')
  const modalDescription = document.querySelector('#movie-modal-description')
  axios.get(INDEX_URL + id)
    .then((response) => {
      const data = response.data.results
      modalContent.innerHTML = `
          <div class="modal-header">
            <!-- Title -->
            <h5 class="modal-title" id="movie-modal-title">${data.title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close">
            </button>
          </div>
          <div class="modal-body" id="movie-modal-body">
            <div class="row">
              <!-- Img src -->
              <div class="col-sm-8" id="movie-modal-image">
                <img
                  src=${POSTER_URL + data.image}
                  alt="movie-poster" class="img-fluid">
              </div>
              <div class="col-sm-4">
                <!-- Release date -->
                <p><em id="movie-modal-date">release date: ${data.release_date}</em></p>
                <!-- description -->
                <p id="movie-modal-description">${data.description}</p>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
          </div>
      `
    })
    .catch((err) => console.log(err))
}

function removeFavorite(id) {
  const movieIndex = movies.findIndex(movie => movie.id === id)
  if (movieIndex === -1) return
  movies.splice(movieIndex, 1)
  localStorage.setItem('favoriteMovies', JSON.stringify(movies))
  renderMovieList(movies)
}


