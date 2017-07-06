(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';var _extends=Object.assign||function(a){for(var b,c=1;c<arguments.length;c++)for(var d in b=arguments[c],b)Object.prototype.hasOwnProperty.call(b,d)&&(a[d]=b[d]);return a},_formHandling=require('./utils/formHandling'),preconfiguredTabs=document.getElementById('pre-configured-tabs'),tabList=document.getElementById('hermit-nav'),tabContentContainer=document.getElementById('tab-content-container'),dynamicTabsContentContainer=document.getElementById('dynamic-tabs-content-container'),getPreconfiguredTabs=function(){fetch('/pre-configured-tabs').then(function(a){if(a.ok)return a;throw new Error('There was an error')}).then(function(a){return a.json()}).then(function(a){var b='';a.forEach(function(a){b+=['<li>','<button ','data-name="'+a.name+'" ','data-site="'+a.site+'" ','data-url="'+a.url+'" ','>',a.name,'<img src="img/service/'+a.name.toLowerCase()+'/'+a.logo+'" alt="" />','</button>','</li>'].join('')}),preconfiguredTabs.innerHTML=b;var c=document.getElementById('add-new-site'),d=preconfiguredTabs.getElementsByTagName('button'),e=!0,f=!1,g=void 0;try{for(var h,i,j=d[Symbol.iterator]();!(e=(h=j.next()).done);e=!0){i=h.value,i.addEventListener('click',function(a){for(var b in a.target.dataset){var d=document.getElementById(b);d&&(d.value=a.target.dataset[b])}c.scrollIntoView()});var k=i.querySelector('img');k&&i.addEventListener('click',function(a){a.target.parentElement.click()})}}catch(a){f=!0,g=a}finally{try{!e&&j.return&&j.return()}finally{if(f)throw g}}})},bindTabTriggers=function(){var a=tabList.querySelectorAll('a'),b=tabContentContainer.querySelectorAll('.tab');a.forEach(function(c){c.addEventListener('click',function(c){c.preventDefault(),a.forEach(function(a){a.removeAttribute('aria-selected')}),c.target.setAttribute('aria-selected','true');var d=document.getElementById(c.target.getAttribute('href').slice(1));b.forEach(function(a){a.setAttribute('aria-hidden','true')}),d.removeAttribute('aria-hidden')})})},getUserTabs=function(){fetch('/user/settings/get').then(function(a){if(a.ok)return a;throw new Error('There was an error')}).then(function(a){return a.json()}).then(function(a){var b=JSON.parse(a.data);b&&(b.forEach(function(a){a.showTab=!1}),createTabs(b),bindTabTriggers())})},createTabs=function(a){var b='',c='';a.forEach(function(a){b+=['<li>','<a ','href="#'+a.id+'" ','id="tab-'+a.name+'" ','role="tab" ','aria-controls="'+a.id+'" ',''+(a.showTab?'aria-selected="true" ':''),'>',a.name,'</a>','</li>'].join(''),c+=['<div ','id="'+a.id+'" ','class="tab" ','role="tabpanel" ','aria-labelledby="tab-'+a.name+'" ',''+(a.showTab?'':'aria-hidden="true" '),'>','<webview ','id="'+a.id+'-webview" ','src="'+a.url+'" ','>','</webview>','</div>'].join('')}),tabList.innerHTML+=b,dynamicTabsContentContainer.innerHTML+=c},init=function(){getPreconfiguredTabs(),getUserTabs();var a=document.getElementById('new-tab-form');a.addEventListener('submit',function(a){a.preventDefault();var b=(0,_formHandling.serializeForm)(a.target);b.id='hermit-'+new Date().getTime(),fetch('/user/settings/set',{method:'POST',headers:{"Content-Type":'application/json'},body:JSON.stringify(b)}).then(function(a){if(a.ok)return a;throw new Error('There was an error')}).then(function(a){console.log(a)});var c=tabContentContainer.querySelectorAll('.tab');c.forEach(function(a){a.setAttribute('aria-hidden','true')});var d=tabList.querySelectorAll('a');return d.forEach(function(a){a.removeAttribute('aria-selected')}),createTabs([_extends({},b,{showTab:!0})]),bindTabTriggers(),!1})};window.addEventListener('load',init);

},{"./utils/formHandling":2}],2:[function(require,module,exports){
'use strict';Object.defineProperty(exports,'__esModule',{value:!0});var serializeForm=exports.serializeForm=function(a){var b={},c=a.querySelectorAll('input[type="text"]');return c.forEach(function(a){b[a.name]=a.value}),b};

},{}]},{},[1]);
