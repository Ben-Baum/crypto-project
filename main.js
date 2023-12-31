"use strict";

(async () => {
  let chooseds = [];
  let cryptos = [];
  const coins = await getCrypto();
  displayCrypto(coins);

  $("#navbar").append(`
    <nav class="navbar navbar-expand-lg bg-body-tertiary">
  <div class="container-fluid">
    <a class="navbar-brand" href="index.html">Home</a>
    <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <span class="navbar-toggler-icon"></span>
    </button>
    <div class="collapse navbar-collapse" id="navbarSupportedContent">
      <ul class="navbar-nav me-auto mb-2 mb-lg-0">
        <li class="nav-item">
          <a class="nav-link active" aria-current="page" href="liveReport.html">Live report</a>
        </li>
        <li class="nav-item">
          <a class="nav-link" href="about.html">About</a>
        </li>
        <li class="nav-item dropdown">
        </li>
      </ul>
      <form class="d-flex" role="search">
        <input id="searchInput" class="form-control me-2" type="search" placeholder="Search" aria-label="Search">
      </form>
    </div>
  </div>
</nav>
<h1>crypto site</h1>`);

  const searchInput = document.getElementById(`searchInput`);
  searchInput.addEventListener('input', srarchCrypto)

  async function srarchCrypto() {
    const searchValue = searchInput.value;
    if (searchValue && searchValue.length > 2) {
      const result = cryptos.filter(item => item.id.indexOf(searchValue) > -1 || item.symbol.indexOf(searchValue) > -1);
      console.log(result)
      if (result.length === 0) {
        $("#parallax").empty();
        $("#parallax").append(`
      <div class="noResult"><p>no coins found</p></div>`);
      } else {
        $("#parallax").empty();
        displayCrypto(result);
      }

    }

    if (searchValue === "") {
      const coins = cryptos;
      $("#parallax").empty();
      displayCrypto(coins);
    }

  }

  async function getCrypto() {
    cryptos = await getJson("api.json");
    displayCrypto(cryptos)
    return cryptos
  }

  async function getCryptoPrices(id) {
    const json = await getJson(`https://api.coingecko.com/api/v3/coins/${id}`);
    return json
  }


  async function getJson(url) {
    const response = await fetch(url);
    const json = await response.json();
    return json;
  }


  function displayCrypto(crypto) {
    for (let i = 0; i < crypto.length; i++) {
      $("#parallax").append(`
   <div class="card" id="${crypto[i]?.id}">
   <label class="switch">
   <input type="checkbox" id="${i}">
   <span class="slider round"></span>
 </label>
  <img src="${crypto[i]?.image}" alt="">
  <div>
    <h5>${crypto[i]?.symbol}</h5>
    <p>${crypto[i]?.name}</p>
    <button class="btn btn-primary">more info</button>
  </div>
  <div class="moreInfo" >
</div>
</div>
`
      )

    };

      

    document.addEventListener('click', function (event) {
      if (event.target.classList.contains('slider')) {
        const card = event.target.closest('.card');
        const index = chooseds.findIndex(item => item.id === card.id);

        if (index === -1 && chooseds.length < 5) {
          const cryptoItem = crypto.find(item => item.id === card.id);
          chooseds.push(cryptoItem);
          console.log(chooseds)
          card.classList.add('chosen');
        } else if (chooseds.length > 4) {
          displayModal();
        }
        
      
          
            function displayModal() {
              const modal = document.querySelector('.modal');
              const modalBody = document.getElementById('modalBody');
              modalBody.innerHTML = `
                <h3>The limit is 5 coins top</h3>
                <h6>Please remove one of the coins from the list below</h6>
              `;
          
              for (let i = 0; i < chooseds.length; i++) {
                const cardId = chooseds[i].id;
                const cryptoItem = crypto.find(item => item.id === cardId);
          
                const containerClass = 'chosenCard card chosen';
          
                modalBody.innerHTML += `
                  <div class="${containerClass}" id="${cryptoItem?.id}">
                    <label class="switch">
                      <input type="checkbox" checked>
                      <span class="slider round"></span>
                    </label>
                    <div>
                      <p class="chosenCardName">${cryptoItem.name}</p>
                    </div>
                  </div>
                `;
              }
          
              modalBody.innerHTML += `
                <button class="btn btn-secondary closeModal">Close</button>
                <button class="btn btn-primary" id="saveModal">Save</button>
              `;
          
              modal.style.display = 'block';
              $(".parallax").css("color","rgb(121, 121, 121)") 
          
              const closeButton = modal.querySelector('.closeModal');
              closeButton.addEventListener('click', function () {
                modal.style.display = 'none';
                $(".parallax").removeClass('dark');
              });
            }
          

        
      }
    });


    document.querySelectorAll('.btn').forEach(function (btn) {
      btn.addEventListener('click', async function () {
        event.preventDefault();
        const card = this.closest('.card');
        const moreInfo = this.closest('.card').querySelector('.moreInfo');

        if (moreInfo.style.display === 'none') {
          const loader = document.createElement('div');
          loader.className = 'loader';
          this.appendChild(loader);

          const cardId = card.id;
          let sessionData = getFromSessionStorge(cardId)
          try {
            if(!sessionData){
              const cryptoApi = await getCryptoPrices(cardId);
              moreInfo.innerHTML = `
            <p>price in USD: ${cryptoApi.market_data.current_price.usd}$</p>
            <p>price in EUR: ${cryptoApi.market_data.current_price.eur}€</p>
            <p>price in NIS: ${cryptoApi.market_data.current_price.ils}₪</p>
          `;
              saveToSessionStorage(cardId, moreInfo);
            }else{
              moreInfo.innerHTML = sessionData;

            }
            moreInfo.style.display = 'block';
          } catch (error) {
            moreInfo.innerHTML = `
        <p>there is a problem with the service please try again later</p>
      `;
          } finally {
            loader.remove();
          }
        } else {
          moreInfo.style.display = 'none';
        }
      });
    });
  }

  function saveToSessionStorage(cardId, moreInfo) {
    sessionStorage.setItem(`${cardId}`, JSON.stringify(moreInfo.innerHTML));
  }

  function getFromSessionStorge(cardId) {
    JSON.parse(sessionStorage.getItem(`${cardId}`));
  }

  $('#liveReportCon').append(
    `<div class="report">
  <img src="img/working on it.jpeg"/>
  </div>
  <p class="paragrph">We working on it :)</p>
  `

  )




  $('#aboutContainer').append(`
<div class="myPhoto"><img src="img/ME.jpeg"></div>
<label class="header padding">About me 
<p class="paragrph">
Hay! im Ben Baum from israel ramat-gan<br>
im a QA engineer in migdal </br>
i'm 30 yo and ready to learn more about full stack web!
</p>
</lable>
<label class="header">About the site 
<p class="paragrph">
this site is a school project.<br>
in this project i used jquery and pure JavaScript.<br>
the main mission was to connect to an online api service,<br>
pull the data from the api and show the data to the user.</br>
the user also can choose up to five coins the see live reports on them
</p></lable>`)


})();