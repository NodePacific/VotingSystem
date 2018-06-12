# EOS Voting System

[English](./README_en.md)

This open source EOSP voting system source code is a system for voting on EOS Block Producer candidate.


Disclaimer：EOS Pacific voting system is based on fair and open principles. It is completely transparent and will not reveal the user's private key, please rest assured to use.


It takes 3 steps to finish the voting:：

1. Query the initial mapping account name according to EOS holder the EOS Public Key.

2. After EOS holder get the account name, import the account according to the account name and the EOS Active Private Key.

3. After EOS holder account being imported, EOS.IO would require EOS as stake pledge for the voting rights, and the stake pledge must be an integral multiple of single EOS. EOS holder can apply for redemption of the pledged EOS at any time, and the EOS that is applied for redemption will be refunded after 72 hours. The redemption of EOS can be pledged, but it cannot be traded.

4. EOS holder would have right to vote for the Block Producer by own choice. Each pledged EOS can be exchanged intoone vote and you can select up to 30 Block Producer candidates using one vote. No repeated voting for the same candidate is allowed for each vote.


Please note that the source code of the EOS Pacific voting system is for communication only and does not provide for testing in the local environment. If you encounter any problems, please contact us： eos.pacific@nodepacific.com

In addition: EOS Pacific dedicated to be the EOS Block Producer candidat, Thanks for voting EOS Pacific!

