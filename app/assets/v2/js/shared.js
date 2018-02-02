// helper functions
var callFunctionWhenTransactionMined = function(txHash, f){
    var transactionReceipt = web3.eth.getTransactionReceipt(txHash, function(error, result){
        if(result){
            f();
        } else {
            setTimeout(function(){
                callFunctionWhenTransactionMined(txHash, f);
            },1000);
        }
    });
};

var loading_button = function(button){
    button.prepend('<img src=/static/v2/images/loading_white.gif style="max-width:20px; max-height: 20px">').addClass('disabled');
}

var unloading_button = function(button){
    button.removeClass('disabled');
    button.find('img').remove();
}

var sanitizeDict = function(d){
    if(typeof d != "object"){
        return d;
    }
    keys = Object.keys(d);
    for(var i=0; i<keys.length; i++){
        var key = keys[i];
        d[key] = sanitize(d[key]);
    }
    return d
}

var sanitizeAPIResults = function(results){
    for(var i=0; i<results.length; i++){
        results[i] = sanitizeDict(results[i]);
    }
    return results
}

var sanitize = function(str){
    if(typeof str != "string"){
        return str;
    }
    result = str.replace(/>/g, '&gt;').replace(/</g, '&lt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
    return result;
}

var waitforWeb3 = function(callback){
    if(document.web3network){
        callback();
    } else {
        var wait_callback = function(){
            waitforWeb3(callback);
        };
        setTimeout(wait_callback, 100);
    }
}

var normalizeURL = function(url){
    return url.replace(/\/$/, '');
}

var _alert = function (msg, _class){
    if(typeof msg == 'string'){
        msg = {
            'message': msg
        }
    }
    var numAlertsAlready = $('.alert:visible').length;
    var top = numAlertsAlready * 66;
    var html = '    <div class="alert '+_class+'" style="top: '+top+'px"> \
      <span class="closebtn" >&times;</span> \
      <strong>' + (typeof msg['title'] != 'undefined' ? msg['title'] : '') + '</strong>\
      ' + msg['message'] + '\
    </div> \
';
    $('body').append(html);
}

var timestamp = function(){
    return Math.floor(Date.now() / 1000);
};


var showLoading = function(){
    $('.loading').css('display', 'flex');
    $(".nonefound").css('display','none');
    $("#primary_view").css('display','none');
    $("#actions").css('display','none');
    setTimeout(showLoading,10);
};

var watch_list = function(){
    if(typeof localStorage['watches'] == 'undefined'){
        return [];
    }
    return localStorage['watches'].split(',');
}

var is_on_watch_list = function(issueURL){
    if(localStorage['watches'] && localStorage['watches'].indexOf(issueURL) != -1){
        return true;
    }
    return false;
}

var add_to_watch_list = function(issueURL){
    if(is_on_watch_list(issueURL)){
        return;
    }
    localStorage['watches'] = localStorage['watches'] + "," + issueURL;
}

var remove_from_watch_list = function(issueURL){
    if(!is_on_watch_list(issueURL)){
        return;
    }
    localStorage['watches'] = localStorage['watches'].replace("," + issueURL,"");
}

function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email);
}

function getParam(parameterName) {
    var result = null,
        tmp = [];
    location.search
        .substr(1)
        .split("&")
        .forEach(function (item) {
          tmp = item.split("=");
          if (tmp[0] === parameterName) result = decodeURIComponent(tmp[1]);
        });
    return result;
}

function timeDifference(current, previous) {

    if(current<previous){
        return "in " + timeDifference(previous, current).replace(" ago","")
    }

    var msPerMinute = 60 * 1000;
    var msPerHour = msPerMinute * 60;
    var msPerDay = msPerHour * 24;
    var msPerMonth = msPerDay * 30;
    var msPerYear = msPerDay * 365;

    var elapsed = current - previous;

    if (elapsed < msPerMinute) {
        var amt = Math.round(elapsed/1000);
        var unit = 'second';
    }

    else if (elapsed < msPerHour) {
        var amt = Math.round(elapsed/msPerMinute);
        var unit = 'minute';
    }

    else if (elapsed < msPerDay ) {
        var amt = Math.round(elapsed/msPerHour );
        var unit = 'hour';
    }

    else if (elapsed < msPerMonth) {
        var amt = Math.round(elapsed/msPerDay);
        var unit = 'day';
    }

    else if (elapsed < msPerYear) {
        var amt = Math.round(elapsed/msPerMonth);
        var unit = 'month';
    }

    else {
        var amt = Math.round(elapsed/msPerYear);
        var unit = 'year';
    }
    var plural = amt != 1 ? 's' : '';
    
    return amt + ' '+unit+plural+' ago';   
};

var sync_web3 = function(issueURL, bountydetails, callback){
    var url = '/sync/web3';
    args = {
        'issueURL': issueURL,
    }
    if(typeof bountydetails != 'undefined'){
        args['bountydetails'] = bountydetails;
        args['contract_address'] = bounty_address();
        args['network'] = document.web3network;
    }
    $.post(url, args, function(){
        if(typeof callback != 'undefined'){
            callback();
        }
    })
}


//sidebar
$(document).ready(function(){

    (function($) {
        $.fn.changeElementType = function(newType) {
            var attrs = {};

            $.each(this[0].attributes, function(idx, attr) {
                attrs[attr.nodeName] = attr.nodeValue;
            });

            this.replaceWith(function() {
                return $("<" + newType + "/>", attrs).append($(this).contents());
            });
        };
    })(jQuery);

    $('.sidebar_search input[type=radio], .sidebar_search label').change(function(e){
        if(document.location.href.indexOf("/dashboard") == -1 && document.location.href.indexOf("/explorer") == -1){
            document.location.href = '/explorer';
            e.preventDefault();
        }
    });

    $("body").delegate(".alert .closebtn", 'click', function(e){
        $(this).parents('.alert').remove();
        $('.alert').each(function(){
            var old_top = $(this).css('top');
            var new_top = (parseInt(old_top.replace('px')) - 66) + 'px';
            $(this).css('top', new_top);
        });
    });
});

//callbacks that can retrieve various metadata about a github issue URL

var retrieveAmount = function(){
    var ele = $("input[name=amount]");
    var target_ele = $("#usd_amount");

    if (target_ele.html() == ""){
        target_ele.html('<img style="width: 50px; height: 50px;" src=/static/v2/images/loading_v2.gif>');
    }

    var amount = $("input[name=amount]").val();
    var address = $('select[name=deonomination').val();
    var denomination = tokenAddressToDetails(address)['name'];
    var request_url = '/sync/get_amount?amount='+amount+'&denomination=' + denomination;
    
    //use cached conv rate if possible.
    if(document.conversion_rates && document.conversion_rates[denomination]){
        var usd_amount = amount / document.conversion_rates[denomination];
        updateAmountUI(target_ele, usd_amount);
        return;
    }

    //if not, use remote one
    $.get(request_url, function(result){

        //update UI
        var usd_amount = result['usdt'];
        var conv_rate = amount / usd_amount;
        updateAmountUI(target_ele, usd_amount);

        //store conv rate for later in cache
        if(typeof document.conversion_rates == 'undefined'){
            document.conversion_rates = {}
        }
        document.conversion_rates[denomination] = conv_rate;

    }).fail(function(){
        target_ele.html(' ');
        //target_ele.html('Unable to find USDT amount');
    });
};

var updateAmountUI = function(target_ele, usd_amount){
        var usd_amount = Math.round(usd_amount * 100 ) / 100;
        if (usd_amount > 1000000){
            usd_amount = Math.round(usd_amount / 100000)/10 + "m"
        } else if (usd_amount > 1000){
            usd_amount = Math.round(usd_amount / 100)/10 + "k"
        }
        target_ele.html('Approx: '+usd_amount+' USD');
};


var retrieveTitle = function(){
    var ele = $("input[name=issueURL]");
    var target_ele = $("input[name=title]");
    var issue_url = ele.val();
    if(typeof issue_url == 'undefined'){
        return;
    }
    if(issue_url.length < 5 || issue_url.indexOf('github') == -1){
        return;
    }
    var request_url = '/sync/get_issue_title?url=' + encodeURIComponent(issue_url);
    target_ele.addClass('loading');
    $.get(request_url, function(result){
        result = sanitizeAPIResults(result);
        target_ele.removeClass('loading');
        if(result['title']){
            target_ele.val(result['title']);
        }
    }).fail(function(){
        target_ele.removeClass('loading');
    });
};
var retrieveKeywords = function(){
    var ele = $("input[name=issueURL]");
    var target_ele = $("input[name=keywords]");
    var issue_url = ele.val();
    if(typeof issue_url == 'undefined'){
        return;
    }
    if(issue_url.length < 5 || issue_url.indexOf('github') == -1){
        return;
    }
    var request_url = '/sync/get_issue_keywords?url=' + encodeURIComponent(issue_url);
    target_ele.addClass('loading');
    $.get(request_url, function(result){
        result = sanitizeAPIResults(result);
        target_ele.removeClass('loading');
        if(result['keywords']){
            var keywords = result['keywords'];
            target_ele.val(keywords.join(', '));
        }
    }).fail(function(){
        target_ele.removeClass('loading');
    });
};

var retrieveOrga = function() {
    var ele = $("input[name=issueURL]");
    var target_ele = $("input[name=orga]");
    var issue_url = ele.val();
    if(typeof issue_url == 'undefined'){
        return;
    }
    if(issue_url.length < 5 || issue_url.indexOf('github') == -1){
        return;
    }
    var request_url = '/sync/get_issue_orga?url=' + encodeURIComponent(issue_url);
    target_ele.addClass('loading');
    $.get(request_url, function(result){
        result = sanitizeAPIResults(result);
        target_ele.removeClass('loading');
        if(result['orga']){
            target_ele.val(result['orga']);
        }
    }).fail(function(){
        target_ele.removeClass('loading');
    });
};

var retrieveRepo = function() {
    var ele = $("input[name=issueURL]");
    var target_ele = $("input[name=repo]");
    var issue_url = ele.val();
    if(typeof issue_url == 'undefined'){
        return;
    }
    if(issue_url.length < 5 || issue_url.indexOf('github') == -1){
        return;
    }
    var request_url = '/sync/get_issue_repo?url=' + encodeURIComponent(issue_url);
    target_ele.addClass('loading');
    $.get(request_url, function(result){
        result = sanitizeAPIResults(result);
        target_ele.removeClass('loading');
        if(result['repo']){
            target_ele.val(result['repo']);
        }
    }).fail(function(){
        target_ele.removeClass('loading');
    });
};

var retrieveIssueNumber = function() {
    var ele = $("input[name=issueURL]");
    var target_ele = $("input[name=issue_number]");
    var issue_url = ele.val();
    if(typeof issue_url == 'undefined'){
        return;
    }
    if(issue_url.length < 5 || issue_url.indexOf('github') == -1){
        return;
    }
    var request_url = '/sync/get_issue_number?url=' + encodeURIComponent(issue_url);
    target_ele.addClass('loading');
    $.get(request_url, function(result){
        result = sanitizeAPIResults(result);
        target_ele.removeClass('loading');
        if(result['issue_number']){
            target_ele.val(result['issue_number']);
        }
    }).fail(function(){
        target_ele.removeClass('loading');
    });
}


//figure out what version of web3 this is
window.addEventListener('load', function() {
    var timeout_value = 100;
    setTimeout(function(){
        if (typeof web3 =='undefined'){
            $("#sidebar_head").html("Web3 disabled <img src='/static/v2/images/icons/question.png'>");
            $("#sidebar_p").html("Please install <a target=new href=https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en> Metamask</a>. ");
        } else if (typeof web3.eth.accounts[0] =='undefined'){
            $("#sidebar_head").html("Web3 locked <img src='/static/v2/images/icons/lock.png'>");
            $("#sidebar_p").html("Please unlock <a target=new href=https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en> Metamask</a>. ");
        } else {
            web3.version.getNetwork((error, netId) => {
                if(!error){

                    //figure out which network we're on
                    var network = "unknown";
                      switch (netId) {
                        case "1":
                          network = 'mainnet';
                          break
                        case "2":
                          network = 'morden';
                          break
                        case "3":
                          network = 'ropsten';
                          break
                        case "4":
                          network = 'rinkeby';
                          break
                        case "42":
                          network = 'kovan';
                          break
                        default:
                          network = "custom network";
                      }
                    document.web3network = network;

                    // is this a supported networK?
                    var is_supported_network = true;
                    var recommended_network = "mainnet or ropsten";

                    if(network == 'rinkeby' || network == 'kovan'){
                        is_supported_network = false;
                    }
                    if(document.location.href.indexOf("https://gitcoin.co") != -1){
                        if(network != 'mainnet' && network != 'ropsten'){
                            is_supported_network = false;
                            recommended_network = "mainnet or ropsten";
                        }
                    }
                    if(network == 'mainnet'){
                        if(document.location.href.indexOf("https://gitcoin.co") == -1){
                            is_supported_network = false;
                        }
                    }
                    var sidebar_p = "Connected to " + network + ".";
                    if(is_supported_network){
                        $("#sidebar_head").html("Web3 enabled <img src='/static/v2/images/icons/rss.png'>");
                    } else {
                        $("#sidebar_head").html("Unsupported network <img src='/static/v2/images/icons/battery_empty.png'>");
                        sidebar_p += "<br>(try " + recommended_network + " instead)";
                    }
                    $("#sidebar_p").html(sidebar_p);
                }
                else {
                    $("#sidebar_head").html("Web3 disabled");
                    $("#sidebar_p").html("Please install & unlock <a target=new href=https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn?hl=en> Metamask</a>. ");
                }
            })
        }
    }, timeout_value);

    setTimeout(function(){
        //detect web3, and if not, display a form telling users they must be web3 enabled.
        var params = {
          page: document.location.pathname,
        }
        if($("#primary_form").length){
            if(typeof web3 == 'undefined'){
                $("#no_metamask_error").css('display', 'block');
                $("#primary_form").remove();
                mixpanel.track("No Metamask Error", params);
                return;
            } else {
                if(!web3.eth.coinbase){
                    $("#unlock_metamask_error").css('display', 'block');
                    $("#primary_form").remove();
                    mixpanel.track("Unlock Metamask Error", params);
                    return;
                }
                web3.eth.getBalance(web3.eth.coinbase, function(errors,result){
                    var balance = result.toNumber();
                    if(balance == 0){
                        $("#zero_balance_error").css('display', 'block');
                        $("#primary_form").remove();
                        mixpanel.track("Zero Balance Metamask Error", params);
                    }
                });
            };
        }
    }, timeout_value);

});
