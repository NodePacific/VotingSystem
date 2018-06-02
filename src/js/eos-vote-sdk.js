var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = y[op[0] & 2 ? "return" : op[0] ? "throw" : "next"]) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [0, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
define("eos-vote-sdk", ["require", "exports", "eosjs", "jquery"], function (require, exports, eosjs, jquery) {
    "use strict";
    function forwardResponseSafe(provider) {
        try {
            return provider()
                .then(function (data) {
                return {
                    code: 0,
                    msg: 'ok',
                    data: data,
                };
            })
                .catch(function (err) {
                return { code: -1, msg: err instanceof Error ? err.message : 'unknown error' };
            });
        }
        catch (err) {
            return Promise.resolve({ code: -1, msg: err instanceof Error ? err.message : 'unknown error' });
        }
    }
    var EosVoteSdk = /** @class */ (function () {
        function EosVoteSdk(params) {
            this._clientDefaultParams = null;
            this._serverDefaultParams = null;
            this._unsignClient = null;
            params = params || {};
            this._clientDefaultParams = params['eosjs'] || {};
            this._serverDefaultParams = params['server'] || {};
            this._unsignClient = null;
        }
        EosVoteSdk.prototype.createClient = function (params) {
            var defaultHttpEndpoint = '';
            var defaultChainId = '';
            var defaultExpireInSeconds = 60;
            params = Object.assign({}, this._clientDefaultParams, params || {});
            var secretKey = params['secretKey'] || null;
            if (secretKey == null && this._unsignClient != null) {
                return this._unsignClient;
            }
            var httpEndpoint = params['httpEndpoint'] || defaultHttpEndpoint;
            var chainId = params['chainId'] || defaultChainId;
            var clientOpts = {
                httpEndpoint: httpEndpoint,
                keyProvider: secretKey != null ? [secretKey] : [],
                sign: secretKey != null,
                debug: false,
                expireInSeconds: defaultExpireInSeconds,
                chainId: chainId,
            };
            var ret = eosjs.Testnet(clientOpts);
            if (secretKey == null) {
                this._unsignClient = ret;
            }
            return ret;
        };
        EosVoteSdk.prototype.doGet = function (path, params) {
            var _this = this;
            return new Promise(function (resolve) {
                var schema = _this._serverDefaultParams['schema'] || '';
                var host = _this._serverDefaultParams['host'] || '';
                var port = _this._serverDefaultParams['port'] || '';
                var base = schema + "://" + host + ":" + port;
                var url = "" + base + path;
                var query = Object.keys(params).map(function (k) { return k + "=" + params[k]; }).join('&');
                var href = query.length > 0 ? url + "?" + query : url;
                jquery.ajax(href, {
                    method: 'GET',
                    success: function (resp) {
                        resolve(resp);
                    },
                    error: function (xhr, status, err) {
                        resolve({
                            code: -1,
                            msg: err || 'unknown error'
                        });
                    }
                });
            });
        };
        EosVoteSdk.prototype.isValidSecretKey = function (params) {
            var _this = this;
            var provider = function () { return __awaiter(_this, void 0, void 0, function () {
                var secretKey, isValid;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            params = params || {};
                            secretKey = params['secretKey'] || '';
                            if (secretKey.length == 0) {
                                throw Error('secretKey must not be empty');
                            }
                            return [4 /*yield*/, eosjs.modules.ecc.isValidPrivate(secretKey)];
                        case 1:
                            isValid = _a.sent();
                            return [2 /*return*/, {
                                    is_valid_secret_key: isValid
                                }];
                    }
                });
            }); };
            return forwardResponseSafe(provider);
        };
        EosVoteSdk.prototype.secretToPublic = function (params) {
            var _this = this;
            var provider = function () { return __awaiter(_this, void 0, void 0, function () {
                var secretKey, publicKey;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            params = params || {};
                            secretKey = params['secretKey'] || '';
                            if (secretKey.length == 0) {
                                throw Error('secretKey must not be empty');
                            }
                            return [4 /*yield*/, eosjs.modules.ecc.privateToPublic(secretKey)];
                        case 1:
                            publicKey = _a.sent();
                            return [2 /*return*/, {
                                    public_key: publicKey
                                }];
                    }
                });
            }); };
            return forwardResponseSafe(provider);
        };
        EosVoteSdk.prototype.checkAccountExist = function (params) {
            var _this = this;
            var provider = function () { return __awaiter(_this, void 0, void 0, function () {
                var accountName, client, resp, accountExisted;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            params = params || {};
                            accountName = params['accountName'] || '';
                            if (accountName.length == 0) {
                                throw Error('accountName must not be empty');
                            }
                            client = this.createClient();
                            return [4 /*yield*/, client.getAccount({
                                    account_name: accountName
                                }).catch(function (err) { return null; })];
                        case 1:
                            resp = _a.sent();
                            accountExisted = resp != null;
                            return [2 /*return*/, {
                                    account_existed: accountExisted
                                }];
                    }
                });
            }); };
            return forwardResponseSafe(provider);
        };
        EosVoteSdk.prototype.fetchDefaultAccount = function (params) {
            var _this = this;
            var provider = function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                var ethAddress, eosPublicKey, accountProvider, resp, eosAccounts;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            params = params || {};
                            ethAddress = (params['ethAddress'] || '');
                            eosPublicKey = (params['eosPublicKey'] || '');
                            if (ethAddress.length == 0 && eosPublicKey.length == 0) {
                                throw Error('either ethAddress or eosPublicKey should be provide');
                            }
                            accountProvider = function () {
                                var path = '/vote/account';
                                var params = {
                                    eth_address: ethAddress,
                                    eos_public_key: eosPublicKey,
                                };
                                return _this.doGet(path, params);
                            };
                            return [4 /*yield*/, accountProvider()];
                        case 1:
                            resp = _a.sent();
                            eosAccounts = resp['data'].map(function (it) {
                                return {
                                    account_name: it['eos_account']
                                };
                            });
                            return [2 /*return*/, eosAccounts];
                    }
                });
            }); };
            return forwardResponseSafe(provider);
        };
        EosVoteSdk.prototype.listCandidate = function (params) {
            var _this = this;
            var provider = function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                var accountName, candidateProvider, votedCandidateAccountProvider, candidates, has_next, votedCandidateAccounts, accounts, ret;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            params = params || {};
                            accountName = params['accountName'] || '';
                            if (accountName.length == 0) {
                                throw Error('accountName must not be empty');
                            }
                            candidateProvider = function () {
                                var path = '/vote/candidates';
                                return _this.doGet(path, params);
                            };
                            votedCandidateAccountProvider = function () { return __awaiter(_this, void 0, void 0, function () {
                                var client, info, voterInfo, producers;
                                return __generator(this, function (_a) {
                                    switch (_a.label) {
                                        case 0:
                                            client = this.createClient();
                                            return [4 /*yield*/, client.getInfo({
                                                    account_name: accountName
                                                })];
                                        case 1:
                                            info = _a.sent();
                                            voterInfo = info['voter_info'] || {};
                                            producers = voterInfo['producers'] || [];
                                            return [2 /*return*/, producers];
                                    }
                                });
                            }); };
                            return [4 /*yield*/, candidateProvider()];
                        case 1:
                            var data = (_a.sent())['data'];

                            has_next = data['has_next'];
                            candidates = data['candidates']
                                .map(function (it) {
                                it['account_name'] = it['account_name'].replace(/\s/g, '');
                                return it;
                            })
                                .filter(function (it) {
                                return it['account_name'].length > 0;
                            });
                            return [4 /*yield*/, votedCandidateAccountProvider()];
                        case 2:
                            votedCandidateAccounts = (_a.sent())
                                .map(function (it) { return it.replace(/\s/g, ''); })
                                .filter(function (it) { return it.length > 0; });
                            accounts = candidates
                                .map(function (it) { return it['account_name']; })
                                .concat(votedCandidateAccounts);
                            accounts = accounts.filter(function (it, idx) { return accounts.indexOf(it) == idx; });
                            var data;
                            data = accounts
                                .map(function (account) {
                                var relativeCandidate = candidates.find(function (it) { return it['account_name'] == account; });
                                var external = relativeCandidate == null;
                                var isVoted = votedCandidateAccounts.indexOf(account) >= 0;
                                var displayName = relativeCandidate != null ? relativeCandidate['display_name'] : account;
                                return {
                                    external: external,
                                    isVoted: isVoted,
                                    accountName: account,
                                    displayName: displayName,
                                };
                            });
                            ret = {
                                'has_next': has_next,
                                'candidates': data
                            };
                            return [2 /*return*/, ret];
                    }
                });
            }); };
            return forwardResponseSafe(provider);
        };
        EosVoteSdk.prototype.fetchAccountInfo = function (params) {
            var _this = this;
            var provider = function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                var accountName, client, balance, info;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            params = params || {};
                            accountName = params['accountName'] || 'unknown account';
                            client = this.createClient();
                            return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                                    var ret;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, client.getTableRows({
                                                    scope: accountName,
                                                    code: 'eosio.token',
                                                    table: 'accounts',
                                                    json: true,
                                                })];
                                            case 1:
                                                ret = _a.sent();
                                                ret = ret.rows
                                                    .map(function (it) { return it.balance; })
                                                    .filter(function (it) { return /\s+EOS$/g.test(it); });
                                                ret = (ret[0] || '0.0000').replace(/\s|EOS$/g, '');
                                                return [2 /*return*/, ret];
                                        }
                                    });
                                }); })()];
                        case 1:
                            balance = _a.sent();
                            return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                                    var info, delegatedBandwidth, voterInfo, stakedOfNet, stakedOfCpu, unstaking;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, client.getAccount({ account_name: accountName })];
                                            case 1:
                                                info = (_a.sent()) || {};
                                                delegatedBandwidth = info['delegated_bandwidth'] || {};
                                                voterInfo = info['voter_info'] || {};
                                                stakedOfNet = (delegatedBandwidth['net_weight'] || '0.0000').replace(/\s|EOS/g, '');
                                                stakedOfCpu = (delegatedBandwidth['cpu_weight'] || '0.0000').replace(/\s|EOS/g, '');
                                                unstaking = (voterInfo['unstaking'] || '0.0000').replace(/\s|EOS/g, '');
                                                return [2 /*return*/, {
                                                        staked_of_cpu: stakedOfCpu,
                                                        staked_of_net: stakedOfNet,
                                                        unstaking: unstaking,
                                                    }];
                                        }
                                    });
                                }); })()];
                        case 2:
                            info = _a.sent();
                            return [2 /*return*/, Object.assign({}, info, { account_name: accountName, balance: balance })];
                    }
                });
            }); };
            return forwardResponseSafe(provider);
        };
        EosVoteSdk.prototype.stake = function (params) {
            var _this = this;
            var provider = function () { return __awaiter(_this, void 0, void 0, function () {
                var _this = this;
                var accountName, broadcast, stakedTotalNew, secretKey, client, _a, stakedOfNetOld, stakedOfCpuOld, stakedTotalOld, stakedTotalNewHalf, stakedOfCpuNew, stakedOfNetNew, stakedOfCpuDelta, stakedOfNetDelta;
                return __generator(this, function (_b) {
                    switch (_b.label) {
                        case 0:
                            params = params || {};
                            accountName = params['accountName'] || '';
                            broadcast = params['broadcast'] || false;
                            stakedTotalNew = Math.floor(params['stakeCount'] || 0);
                            secretKey = params['secretKey'] || '';
                            if (stakedTotalNew <= 0) {
                                throw Error('tokenCount must gt 0');
                            }
                            if (accountName.length == 0) {
                                throw Error('accountName must not be empty');
                            }
                            if (secretKey.length == 0) {
                                throw Error('secretKey must not be empty');
                            }
                            client = this.createClient({ secretKey: secretKey });
                            return [4 /*yield*/, (function () { return __awaiter(_this, void 0, void 0, function () {
                                    var info, delegatedBandwidth, voterInfo, stakedOfNet, stakedOfCpu;
                                    return __generator(this, function (_a) {
                                        switch (_a.label) {
                                            case 0: return [4 /*yield*/, client.getAccount({ account_name: accountName })];
                                            case 1:
                                                info = (_a.sent()) || {};
                                                delegatedBandwidth = info['delegated_bandwidth'] || {};
                                                voterInfo = info['voter_info'] || {};
                                                stakedOfNet = Number.parseFloat((delegatedBandwidth['net_weight'] || '0.0000').replace(/\s|EOS/g, ''));
                                                stakedOfCpu = Number.parseFloat((delegatedBandwidth['cpu_weight'] || '0.0000').replace(/\s|EOS/g, ''));
                                                return [2 /*return*/, [stakedOfNet, stakedOfCpu, stakedOfNet + stakedOfCpu]];
                                        }
                                    });
                                }); })()];
                        case 1:
                            _a = _b.sent(), stakedOfNetOld = _a[0], stakedOfCpuOld = _a[1], stakedTotalOld = _a[2];
                            if (stakedTotalNew == stakedTotalOld) {
                                throw Error('stakedTotalNew should not eq stakedTotalOld');
                            }
                            stakedTotalNewHalf = Math.floor(stakedTotalNew / 2);
                            stakedOfCpuNew = stakedTotalNewHalf;
                            stakedOfNetNew = stakedTotalNew - stakedTotalNewHalf;
                            stakedOfCpuDelta = stakedOfCpuNew - stakedOfCpuOld;
                            stakedOfNetDelta = stakedOfNetNew - stakedOfNetOld;
                            // console.log({
                            //     stakedOfNetOld,
                            //     stakedOfCpuOld,
                            //     stakedTotalOld,
                            //     stakedOfNetNew,
                            //     stakedOfCpuNew,
                            //     stakedTotalNew,
                            //     stakedOfCpuDelta,
                            //     stakedOfNetDelta,
                            // })
                            return [4 /*yield*/, client.transaction(function (tx) {
                                    if (stakedOfCpuDelta != 0) {
                                        if (stakedOfCpuDelta > 0) {
                                            tx.delegatebw({
                                                from: accountName,
                                                receiver: accountName,
                                                stake_net_quantity: '0.0000 EOS',
                                                stake_cpu_quantity: stakedOfCpuDelta + " EOS",
                                                transfer: 0,
                                            });
                                        }
                                        else {
                                            tx.undelegatebw({
                                                from: accountName,
                                                receiver: accountName,
                                                unstake_net_quantity: '0.0000 EOS',
                                                unstake_cpu_quantity: Math.abs(stakedOfCpuDelta) + " EOS",
                                            });
                                        }
                                    }
                                    if (stakedOfNetDelta != 0) {
                                        if (stakedOfNetDelta > 0) {
                                            tx.delegatebw({
                                                from: accountName,
                                                receiver: accountName,
                                                stake_net_quantity: stakedOfNetDelta + " EOS",
                                                stake_cpu_quantity: '0.0000 EOS',
                                                transfer: 0,
                                            });
                                        }
                                        else {
                                            tx.undelegatebw({
                                                from: accountName,
                                                receiver: accountName,
                                                unstake_net_quantity: Math.abs(stakedOfNetDelta) + " EOS",
                                                unstake_cpu_quantity: "0.0000 EOS",
                                            });
                                        }
                                    }
                                }, { broadcast: broadcast })];
                        case 2:
                            // console.log({
                            //     stakedOfNetOld,
                            //     stakedOfCpuOld,
                            //     stakedTotalOld,
                            //     stakedOfNetNew,
                            //     stakedOfCpuNew,
                            //     stakedTotalNew,
                            //     stakedOfCpuDelta,
                            //     stakedOfNetDelta,
                            // })
                            _b.sent();
                            return [2 /*return*/, null];
                    }
                });
            }); };
            return forwardResponseSafe(provider);
        };
        EosVoteSdk.prototype.vote = function (params) {
            var _this = this;
            var provider = function () { return __awaiter(_this, void 0, void 0, function () {
                var accountName, broadcast, secretKey, candidates, client;
                return __generator(this, function (_a) {
                    switch (_a.label) {
                        case 0:
                            params = params || {};
                            accountName = params['accountName'] || '';
                            broadcast = params['broadcast'] || false;
                            secretKey = params['secretKey'] || '';
                            candidates = params['candidates'] || [];
                            if (accountName.length == 0) {
                                throw Error('accountName must not be empty');
                            }
                            if (secretKey.length == 0) {
                                throw Error('secretKey must not be empty');
                            }
                            return [4 /*yield*/, this.createClient({ secretKey: secretKey })];
                        case 1:
                            client = _a.sent();
                            return [4 /*yield*/, client.transaction(function (tx) {
                                    tx.voteproducer({
                                        voter: accountName,
                                        proxy: '',
                                        producers: candidates
                                    });
                                }, { broadcast: broadcast })];
                        case 2:
                            _a.sent();
                            return [2 /*return*/, null];
                    }
                });
            }); };
            return forwardResponseSafe(provider);
        };
        return EosVoteSdk;
    }());
    return EosVoteSdk;
});
