import React, { useState, useEffect } from 'react';
import Web3 from 'web3';
import './Crowdfunding.css';
import abi from './abi.jsx';

function Crowdfunding() {
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [target, setTarget] = useState('');
  const [imageURL, setImageURL] = useState('');
  const [endTime, setEndTime] = useState('');
  const [campaigns, setCampaigns] = useState([]);
  const [donationAmount, setDonationAmount] = useState('');
  const [selectedCampaignId, setSelectedCampaignId] = useState(null);
  const [imageError, setImageError] = useState('');

  useEffect(() => {
    const loadWeb3 = async () => {
      if (window.ethereum) {
        const provider = new Web3(window.ethereum);
        setWeb3(provider);
        try {
          await window.ethereum.request({ method: 'eth_requestAccounts' });
          const accounts = await provider.eth.getAccounts();
          setAccount(accounts[0]);
        } catch (error) {
          console.log('Request rejected', error);
        }
      } else {
        console.log('Metamask not detected');
      }
    };

    loadWeb3();
  }, []);

 

  useEffect(() => {
    const loadContract = async () => {
      if (web3 ) {
        try {
          const address = '0x3C377c08b0046094261aD4531E2602F5457627D6'; //Sepolia network 
          const contract = new web3.eth.Contract(abi, address);
  
          console.log("Contract address:", address);
          setContract(contract);

          await loadCampaigns(contract);
        } catch (error) {
          console.error('Error loading contract:', error);
        }
      } else {
        console.error('Web3 not found.');
      }
    };
  
    loadContract();
  }, [web3]);
  

  const connectAccount = async () => {
    try {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      setAccount(accounts[0]);
    } catch (error) {
      console.error('Error connecting account', error);
    }
  };

  const createCampaign = async () => {
    if (contract && account) {
      try {
        const weiTarget = web3.utils.toWei(target, 'ether');
       await contract.methods.createCampaign(title, description, weiTarget , imageURL, Date.parse(endTime) / 1000).send({ from: account});
  

        console.log('Campaign created successfully');
        await loadCampaigns(contract);
      } catch (error) {
        console.error('Error in createCampaign:', error);
      }
    }
  };


  const loadCampaigns = async (contractInstance) => {
    try {
      const campaignCount = await contractInstance.methods.numCampaigns().call();
      const loadedCampaigns = [];
      for (let i = 1; i <= campaignCount; i++) {
        const campaign = await contractInstance.methods.campaigns(i).call();
        loadedCampaigns.push({
          id: campaign.id,
          title: campaign.title,
          description: campaign.description,
          target: campaign.target.toString(),
          raised: campaign.raised.toString(),
          startTime: campaign.startTime.toString(),
          endTime: campaign.endTime.toString(),
          imageURL: campaign.imageURL,
        });
      }
      setCampaigns(loadedCampaigns);
    } catch (error) {
      console.error('Error loading campaigns:', error);
    }
  };

  const handleDonate = async () => {
    if (contract && account && selectedCampaignId && donationAmount) {
      try {
        const weiAmount = web3.utils.toWei(donationAmount, 'ether');
        await contract.methods.contribute(selectedCampaignId).send({ from: account, value: weiAmount });
        console.log('Donation successful');
        await loadCampaigns(contract);
        setSelectedCampaignId(null); 
      } catch (error) {
        console.error('Error in handleDonate:', error);
      }
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    const maxSize = 30 * 1024; 
    if (file.size > maxSize) {
      setImageError('Image size must be less than 30 KB');
    } else {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImageURL(reader.result);
        setImageError('');
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      <div className="title" id="title">
        <h1>Web3 Crowdfunding</h1>
        <div>
          <a href="#title">Home</a>
          <a href="#newcampaign">Create Campaign</a>
          <a href="#campaigns">Campaigns</a>
        </div>
      </div>

      <div className="home" id="home">
        <h2>Welcome to Web3 Crowdfunding</h2>
        <div>
          <p>Connect your wallet to get started</p>
          <div>
            {!account ? (
              <button onClick={connectAccount}>Connect Wallet</button>
            ) : (
              <button>Connected</button>
            )}
          </div>
        </div>
      </div>

      <div className="newcampaign" id="newcampaign">
        <h1>Create New Campaign</h1>
        <div>
          <input type="file" onChange={handleImageUpload} /> <br />
          {imageError && <p style={{ color: 'red' }}>{imageError}</p>}
          <input type="text" placeholder="Title" onChange={(e) => setTitle(e.target.value)} /> <br />
          <input type="text" placeholder="Description" onChange={(e) => setDescription(e.target.value)} /> <br />
          <input type="text" placeholder="Target (ETH)" onChange={(e) => setTarget(e.target.value)} /> <br />
          <input type="date" onChange={(e) => setEndTime(e.target.value)} />
          <button onClick={createCampaign}>Create Campaign</button>
        </div>
      </div>

      <div className="campaigns" id="campaigns">
        <h1>Campaigns</h1>
        {campaigns.length === 0 ? (
          <p>No campaigns found.</p>
        ) : (
          campaigns.map((campaign) => (
            <div key={campaign.id} className="campaign">
              <img src={campaign.imageURL} alt={campaign.title} style={{ maxWidth: '200px' }} />
              <h2>{campaign.title}</h2>
              <p className="pp">{campaign.description}</p>
              <h4>Target: {web3.utils.fromWei(campaign.target, 'ether')} ETH</h4>
              <h4>Raised: {web3.utils.fromWei(campaign.raised, 'ether')} ETH</h4>
              <p>Start Time: {new Date(parseInt(campaign.startTime) * 1000).toLocaleString()}</p>
              <p>End Time: {campaign.endTime !== '0' ? new Date(parseInt(campaign.endTime) * 1000).toLocaleString() : 'N/A'}</p>
              {parseInt(campaign.raised) >= parseInt(campaign.target) ? (
                <p style={{ color: 'red' }}>Campaign Ended</p>
              ) : (
                <>
                  <input type="number" placeholder="Amount to donate (ETH)" onChange={(e) => setDonationAmount(e.target.value)} />
                  <button onClick={() => setSelectedCampaignId(campaign.id)}>Donate</button>
                  {selectedCampaignId === campaign.id && (
                    <button onClick={handleDonate}>Confirm Donation</button>
                  )}
                </>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

export default Crowdfunding;
