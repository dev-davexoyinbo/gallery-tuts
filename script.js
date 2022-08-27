const unsplash = new UnspashClient();
const urlParams = new URLSearchParams(location.search);

const photoContainer = document.querySelector("#photo-container");
const photoColumns = Array.from(
  photoContainer.querySelectorAll(".photo-container-column")
);
const searchForm = document.querySelector("#search-form");
const searchInput = searchForm.querySelector("input");
const photoArray = [];

if (urlParams.has("query")) {
  unsplash.searchParam = urlParams.get("query") || "";
  searchInput.value = unsplash.searchParam;
}

const renderPhotos = () => {
  unsplash.getImages().then((images) => {
    photoArray.forEach((card) => {
      card.destroy();
    });
    photoArray.splice(0, photoArray.length);
    images.forEach((image, imageIndex) => {
      const card = new PhotoCard({
        imageUrl: image.urls.small,
        caption: image.user.name,
      });
      photoArray.push(card);
      photoColumns[imageIndex % photoColumns.length].append(card.element);
    });
  });
}; //end function renderPhotos

searchForm.addEventListener("submit", (event) => {
  event.preventDefault();
  unsplash.searchParam = searchInput.value || "";

  const currentUrl = location.origin + location.pathname;
  const params = new URLSearchParams(location.search);
  params.set("query", unsplash.searchParam);
  history.pushState({}, null, `${currentUrl}?${params.toString()}`);
  renderPhotos();
});

renderPhotos();

////////////////////////////////////////////////////////////////
///////////Photo Card /////////////////////////
/////////////////////////////////////////////////////////////////
function PhotoCard(props) {
  const innerHtml = `
        <article class="rounded-md overflow-hidden">
            <figure class="relative">
                <img class="w-full h-auto transform transition hover:scale-[1.05]" src="${props.imageUrl}" alt="">
                <span class="absolute left-0 bottom-0 p-4 text-white font-medium text-sm block w-full bg-gradient-to-t from-gray-700 via-gray-700/70 to-transparent"><caption>${props.caption}</caption></span>
            </figure>
        </article>`;

  const wrapper = document.createElement("div");
  wrapper.innerHTML = innerHtml;

  this.element = wrapper.firstElementChild;

  this.destroy = () => {
    if (this.element && document.contains(this.element)) this.element.remove();
  };
} //end photoCard

// ////////////////////////////////////////////////////////////////
///////////UNSPLASH LOGIC /////////////////////////
/////////////////////////////////////////////////////////////////
function UnspashClient() {
  const clientID = `u4bMF7kLaTe0CS8sqfuxtagQLmMqtPbFv0Qrc0GLJvY`;
  const client = axios.create({
    baseURL: "https://api.unsplash.com",
    headers: {
      Authorization: `Client-ID ${clientID}`,
    },
  });

  const randomPath = "/photos";
  const searchPath = "/search/photos";

  this.searchParam = "";

  const getPathUrl = () => {
    const query = this.searchParam;

    const params = {
      per_page: 100,
      query,
    };

    const baseUrl = this.searchParam ? searchPath : randomPath;
    const paramString = Object.keys(params).reduce((acc, curr) => {
      return `${acc}&${curr}=${encodeURI(params[curr])}`.replace(
        /(^&+)|(&+$)/g,
        ""
      );
    }, "");

    return `${baseUrl}?${paramString}`;
  };

  this.getImages = () => {
    return client.get(getPathUrl()).then((response) => {
      return response.data.results ?? response.data;
    });
  };
} //end function UnsplashClient
