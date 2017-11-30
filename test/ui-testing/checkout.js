const Nightmare = require('../xnightmare.js')
const assert = require('assert')
const config = require('../folio-ui.config.js')
const helpers = require('../helpers.js')
const user = helpers.namegen()

describe('Exercise users, items, checkout, checkin, settings ("test-checkout")', function () {
  this.timeout(Number(config.test_timeout))

  describe("Login > Update settings > Find user > Checkout item > Confirm checkout > Checkin > Confirm checkin > Logout\n", () => {
    let nightmare = new Nightmare(config.nightmare)
    let userid = 'user'
    let barcode = 'item'
    let uselector = "#list-users div[role='listitem']:nth-of-type(12) > a > div:nth-of-type(5)"

    it('should login as ' + config.username + '/' + config.password, done => {
      nightmare
      .on('page', function(type="alert", message) {
        throw new Error(message)
       })
      .goto(config.url)
      .wait(Number(config.login_wait))
      .insert(config.select.username, config.username)
      .insert(config.select.password, config.password)
      .click('#clickable-login')
      .wait('#clickable-logout')
      .then(result => { done() })
      .catch(done)
    })
    it('should set patron scan ID to "User"', done => {
      nightmare
      .wait(config.select.settings)
      .click(config.select.settings)
      .wait('a[href="/settings/checkout"]')
      .click('a[href="/settings/checkout"]')
      .wait('a[href="/settings/checkout/checkout"]')
      .click('a[href="/settings/checkout/checkout"]')
      .wait('#patronScanId')
      .wait(222)
      .select('#patronScanId','USER')
      .then(result => { done() })
      .catch(done)
    })
    it('should find an active user ', done => {
      nightmare
      .click('#clickable-users-module')
      .wait(uselector)
      .evaluate(function(selector) {
        return document.querySelector(selector).title
      }, uselector)
      .then(function(result) {
        userid = result
        console.log('          Found user ' + userid)
        done()
      })
      .catch(done)
    })
    it('should find an item to checkout', done=> {
      nightmare
      .click('#clickable-items-module')
      .wait(2222)
      .evaluate(function() {
        var element = document.evaluate('//div[.="Available"]/preceding-sibling::div[2]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
        return element.singleNodeValue.innerHTML
      })
      .then(function(result) {
        console.log('          Found item ' + result)
        barcode = result
        done()
      })
      .catch(done)
    })
    it('should check out ' + barcode + ' to ' + userid, done => {
      nightmare
      .click('#clickable-checkout-module')
      .wait('#input-patron-identifier')
      .wait(222)
      .type('#input-patron-identifier',userid)
      .wait(222)
      .click('#clickable-find-patron')
      .wait('#patron-form ~ div a > strong')
      .wait(222)
      .type('#input-item-barcode',barcode)
      .wait(222)
      .click('#clickable-add-item')
      .wait(1111)
      .evaluate(function() {
        var sel = document.querySelector('div[class^="textfieldError"]')
	if (sel) {
	  throw new Error(sel.textContent)
	}
      })
      .wait(222) 
      .click('#section-item button')
      .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
      .then(result => { done() })
      .catch(done)
    })
    it('should find ' + barcode + ' in ' + userid + '\'s open loans', done => {
      nightmare
      .click('#clickable-users-module')
      .wait('#input-user-search')
      .click('#input-user-search~button')
      .wait(222)
      .type('#input-user-search',userid)
      .wait('#list-users div[title="' + userid + '"]')
      .wait(222)
      .click('#list-users div[title="' + userid + '"]')
      .wait(2222)
      .click('#clickable-viewcurrentloans')
      //.wait('div[title="' + barcode + '"]')
      .wait(function(barcode) {
        var element = document.evaluate('id("list-loanshistory")//a[.="' + barcode + '"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
	if (!element) {
	  return false
	}
	else {
	  return true
	}
      }, barcode)
      .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
      .then(result => { done() })
      .catch(done)
    }) 
    it('should check in ' + barcode, done => {
      nightmare
      .click('#clickable-checkin-module')
      .wait(222)
      .type('#input-item-barcode',barcode)
      .wait(222)
      .click('#clickable-add-item')
      .wait(1111)
      .evaluate(function() {
        var a = document.querySelector('div[title="Available"]')
	if (a == undefined) {
	  throw new Error("Checkin did not return 'Available' status")
	}
      })
      .then(result => {
        done() 
      })
      .catch(done)
    })
    it('should confirm ' + barcode + ' in ' + userid + '\'s closed loans', done => {
      nightmare
      .click('#clickable-users-module')
      .wait('#input-user-search')
      .click('#input-user-search ~ button')
      .type('#input-user-search',userid)
      .wait(222)
      .click('div[title="' + userid + '"]')
      .wait(222)
      .click('#clickable-viewclosedloans')
      .wait(function(barcode) {
        var element = document.evaluate('id("list-loanshistory")//a[.="' + barcode + '"]', document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null)
	if (!element) {
	  return false
	}
	else {
	  return true
	}
      }, barcode)
      //.wait('div[title="' + barcode + '"]')
      .wait(parseInt(process.env.FOLIO_UI_DEBUG) ? parseInt(config.debug_sleep) : 555) // debugging
      .then(result => { done() })
      .catch(done)
    })
    it('should logout', done => {
      nightmare
      .click('#clickable-logout')
      .wait(config.select.username)
      .end()
      .then(result => { done() })
      .catch(done)
    })
  })
})
