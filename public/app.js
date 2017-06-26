var ssidSelect = document.querySelector('#ssid');

fetch('/networks')
.then(response => response.json())
.then((networks) => {
  console.log(networks);
  var optionsFragment = document.createDocumentFragment();
  networks
  .sort((first, second) => first.ssid.toUpperCase().localeCompare(second.ssid.toUpperCase()))
  .forEach((network) => {
    var option = document.createElement('option');
    var valueText = document.createTextNode(network.ssid);
    option.setAttribute('value', network.ssid);
    option.appendChild(valueText);
    optionsFragment.appendChild(option);
  });

  ssidSelect.innerHTML = '';
  ssidSelect.appendChild(optionsFragment);
});
