//linking the model
import * as model from './model.js';
import recipeView from './views/recipeView.js';
import searchView from './views/searchView.js';
import resultsView from './views/resultsView.js';
import paginationView from './views/paginationView.js';
import bookmarksView from './views/bookmarksView.js';
import addRecipeView from './views/addRecipeView.js';
import 'regenerator-runtime/runtime';

import { MODAL_CLOSE_SEC } from './config.js';
import 'core-js/stable';
const recipeContainer = document.querySelector('.recipe');

/* if (module.hot) {
  module.hot.accept();
} */

// https://forkify-api.herokuapp.com/v2

///////////////////////////////////////

const controlRecipies = async function () {
  try {
    const id = window.location.hash.slice(1);

    if (!id) return;
    recipeView.renderSpinner();

    //0 update result view to show selected recipie result
    resultsView.update(model.getSearchResultsPage());
    bookmarksView.update(model.state.bookmarks);

    //1. loading recipe
    await model.loadRecipe(id);
    const { recipe } = model.state;

    //2. rendering recipe
    recipeView.render(model.state.recipe);
  } catch (err) {
    console.log(err);
    recipeView.renderError();
  }
};
// controlRecipies();

const controlSearchResults = async function () {
  try {
    //1 render spinner
    resultsView.renderSpinner();

    //2 get the search query
    const query = searchView.getQuery();
    if (!query) return;

    //3 load results
    await model.loadSearchResults(query);

    //4 render the results
    resultsView.render(model.getSearchResultsPage());

    //5 render pagination buttons
    paginationView.render(model.state.search);
  } catch (err) {
    console.log(err);
  }
};

const controlPagination = function (goToPage) {
  //1 render New the results
  resultsView.render(model.getSearchResultsPage(goToPage));

  //2 renderNew pagination buttons
  paginationView.render(model.state.search);
};

const controlServings = function (newServing) {
  //1 update servings and quantities
  model.updateServings(newServing);

  //2 render new recipe
  recipeView.update(model.state.recipe);
};

const controllAddBookmark = function () {
  //1 add/remove bookmarks
  if (!model.state.recipe.bookmarked) model.addBookmark(model.state.recipe);
  else model.deleteBookmark(model.state.recipe.id);

  //2 update recipe view
  recipeView.update(model.state.recipe);

  //render bookmarks
  bookmarksView.render(model.state.bookmarks);
};
const controlBookmarks = function () {
  bookmarksView.render(model.state.bookmarks);
};

const controllAddRecipe = async function (newRecipe) {
  try {
    //adding spinner
    addRecipeView.renderSpinner();
    //upload recipe
    await model.uploadRecipe(newRecipe);
    console.log(model.state.recipe);

    //render recipe
    recipeView.render(model.state.recipe);

    //success message
    addRecipeView.renderMessage();

    //render bookmark view
    bookmarksView.render(model.state.bookmarks);

    //change url
    window.history.pushState(null, '', `#${model.state.recipe.id}`);

    //close form window
    setTimeout(function () {
      addRecipeView.toggleWindow();
    }, MODAL_CLOSE_SEC * 1000);
  } catch (err) {
    console.error('⚡', err);
    addRecipeView.renderError(err.message);
  }
};
const init = function () {
  bookmarksView.addHandlerRender(controlBookmarks);
  recipeView.addHandlerRender(controlRecipies);
  searchView.addHandlerSearch(controlSearchResults);
  paginationView.addHandlerClick(controlPagination);
  recipeView.addHandlerUpdateServings(controlServings);
  recipeView.addHandlerAddBookmark(controllAddBookmark);
  addRecipeView.addHandlerUpload(controllAddRecipe);
};
init();
