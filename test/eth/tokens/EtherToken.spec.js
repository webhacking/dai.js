import EthereumTokenService from '../../../src/eth/EthereumTokenService';
import tokens from '../../../contracts/tokens';
import TestAccountProvider from '../../../src/utils/TestAccountProvider';


test('get Ether allowance returns max safe integer', (done) => {
  const ethereumTokenService = EthereumTokenService.buildTestService();
  ethereumTokenService.manager().authenticate().then(() => {
    const token = ethereumTokenService.getToken(tokens.ETH);
    return token.allowance(TestAccountProvider.nextAddress(), TestAccountProvider.nextAddress());
  })
    .then(allowance => {
      expect(allowance.toString()).toEqual(Number.MAX_SAFE_INTEGER.toString());
      done();
    });
});

test('get Ether balance using test blockchain', (done) => {
  const ethereumTokenService = EthereumTokenService.buildTestService();

  ethereumTokenService.manager().authenticate().then(() => {
    const token =  ethereumTokenService.getToken(tokens.ETH);
    return token.balanceOf(TestAccountProvider.nextAddress());
  })
    .then(balance => {
      expect(balance).toEqual('100.0');
      done();
    });
});

test('approve and approveUnlimited should resolve to true', done => {
  const ethereumTokenService = EthereumTokenService.buildTestService();

  let token = null;

  ethereumTokenService.manager().authenticate().then(() => {
    token =  ethereumTokenService.getToken(tokens.ETH);
    return token.approve(TestAccountProvider.nextAddress(), '0.1');
  })
    .then(result => {
      expect(result).toBe(true);
      return token.approveUnlimited(TestAccountProvider.nextAddress());
    })
    .then(result => {
      expect(result).toBe(true);
      done();
    });
});

test('ether transfer should move transferValue from sender to receiver', done => {
  const ethereumTokenService = EthereumTokenService.buildTestService(),
    receiver = TestAccountProvider.nextAddress();

  let sender = null, token = null, senderBalance = null, receiverBalance = null;

  ethereumTokenService.manager().authenticate().then(() => {
    sender = ethereumTokenService.get('web3').defaultAccount();
    token =  ethereumTokenService.getToken(tokens.ETH);
    return Promise.all([ token.balanceOf(sender), token.balanceOf(receiver) ]);
  })
    .then(balances => {
      senderBalance = parseFloat(balances[0]);
      receiverBalance = parseFloat(balances[1]);
      return token.transfer(receiver, '0.1').onMined();
    })
    .then(() => Promise.all([ token.balanceOf(sender), token.balanceOf(receiver) ]))
    .then(balances => {
      const newSenderBalance = parseFloat(balances[0].toString()),
        newReceiverBalance = parseFloat(balances[1].toString());
      expect(newSenderBalance).toBeCloseTo(senderBalance - 0.1, 12);
      expect(newReceiverBalance).toBeCloseTo(receiverBalance + 0.1, 12);
      done();
    });
}, 10000);

test('ether transferFrom should move transferValue from sender to receiver', done => {
  const ethereumTokenService = EthereumTokenService.buildTestService(),
    receiver = TestAccountProvider.nextAddress();

  let sender = null, token = null, senderBalance = null, receiverBalance = null;

  ethereumTokenService.manager().authenticate().then(() => {
    sender = ethereumTokenService.get('web3').defaultAccount();
    token =  ethereumTokenService.getToken(tokens.ETH);
    return Promise.all([ token.balanceOf(sender), token.balanceOf(receiver) ]);
  })
    .then(balances => {
      senderBalance = parseFloat(balances[0]);
      receiverBalance = parseFloat(balances[1]);
      return token.transferFrom(sender, receiver, '0.1').onMined();
    })
    .then(() => {
      return Promise.all([ token.balanceOf(sender), token.balanceOf(receiver) ]);
    })
    .then(balances => {
      const newSenderBalance = parseFloat(balances[0].toString()),
        newReceiverBalance = parseFloat(balances[1].toString());
      expect(newSenderBalance).toBeCloseTo(senderBalance - 0.1, 12);
      expect(newReceiverBalance).toBeCloseTo(receiverBalance + 0.1, 12);
      done();
    });
}, 10000);
