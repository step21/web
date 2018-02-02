window.onload = function(){
    //a little time for web3 injection
    setTimeout(function(){
        var account = web3.eth.accounts[0];

        if(getParam('source')){
            $('input[name=issueURL]').val(getParam('source'));
        }
        if (typeof localStorage['acceptTOS'] !='undefined' && localStorage['acceptTOS']){
            $('input[name=terms]').attr('checked','checked');
        }

        var bountyDetails = []

        $('.submitBounty').click(function(e){
            mixpanel.track("Process Bounty Clicked", {});
            e.preventDefault();
            var whatAction = $(this).html().trim()
            var issueURL = $('input[name=issueURL]').val();

            var isError = false;
            if($('#terms:checked').length == 0){
                _alert({ message: "Please accept the terms of service." });
                isError = true;
            } else {
                localStorage['acceptTOS'] = true;
            }
            if(issueURL == ''){
                _alert({ message: "Please enter a issue URL." });
                isError = true;
            }
            if(isError){
                return;
            }

            var bounty = web3.eth.contract(bounty_abi).at(bounty_address());
            loading_button($(this));
            var callback = function(error, result){
                if(error){
                    mixpanel.track("Process Bounty Error", {step: 'callback', error: error});
                    _alert({ message: "Could not get bounty details" });
                    console.error(error);
                    unloading_button($('.submitBounty'));
                    return;
                } else {
                    var bountyAmount = result[0].toNumber(); 
                    bountyDetails = [bountyAmount, result[1], result[2], result[3]];
                    var fromAddress = result[2];
                    var claimeeAddress = result[3];
                    var open = result[4];
                    var initialized = result[5];

                    var errormsg = undefined;
                    if(bountyAmount == 0 || open == false || initialized == false){
                        errormsg = "No active funding found at this address.  Are you sure this is an active funded issue?";
                    } else if(claimeeAddress == '0x0000000000000000000000000000000000000000'){
                        errormsg = "No claimee found for this bounty.";
                    } else if(fromAddress != web3.eth.coinbase){
                        errormsg = "You can only process a funded issue if you submitted it.";
                    }

                    if(errormsg){
                        _alert({ message: errormsg });
                        unloading_button($('.submitBounty'));
                        return;
                    }

                    var _callback = function(error, result){
                        var next = function(){
                            localStorage['txid'] = result;
                            sync_web3(issueURL);
                            localStorage[issueURL] = timestamp();
                            add_to_watch_list(issueURL);
                            _alert({ message: "Submitted transaction to web3." }, 'info');
                            setTimeout(function(){
                                mixpanel.track("Process Bounty Success", {});
                                document.location.href= "/funding/details/" + orga + "/" + repo + "/issues/" + issue_umber
                            },1000);

                        };
                        if(error){
                            mixpanel.track("Process Bounty Error", {step: '_callback', error: error});
                            _alert({ message: "There was an error" });
                            console.error(error);
                            unloading_button($('.submitBounty'));
                        } else {
                            next();
                        }
                    };

                    var method = bounty.approveBountyClaim;
                    if(whatAction != 'Accept'){
                        method = bounty.rejectBountyClaim;
                    }
                    method.estimateGas(issueURL, {from :account}, 
                            function(errors,result){
                                if(errors){
                                    console.error(errors);
                                    mixpanel.track("Process Bounty Error", {step: 'estimateGas', error: error});
                                    _alert({ message: "There was an error" });
                                    unloading_button($('.submitBounty'));
                                }
                                mixpanel.track("Process Bounty Error", {step: 'estimateGas', error: errors});
                                var gas = Math.round(result * gasMultiplier);
                                var gasLimit = Math.round(gas * gasLimitMultiplier);
                                var params = {from :account, 
                                        gas:web3.toHex(gas), 
                                        gasLimit: web3.toHex(gasLimit), 
                                        gasPrice:web3.toHex(defaultGasPrice), 
                                    };
                                method.sendTransaction(issueURL, 
                                    params, 
                                    _callback);
                            }
                        );


                }
            };
            bounty.bountydetails.call(issueURL, callback);
            e.preventDefault();
        });
    },100);

};
