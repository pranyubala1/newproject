//SPDX-License-Identifier: MIT

pragma solidity ^0.8.24;

contract Crowdfunding {

struct Campaign {
        uint id;
        address creator;
        uint target;
        string title;
        uint startTime;
        uint endTime;
        string description;
        uint raised;
        string imageURL;
        bool ended;
        mapping(address => uint) contributions;
    }

    mapping(uint => Campaign) public campaigns;
    uint public numCampaigns;

    event CampaignCreated(uint id, string title, string description, uint target, string imageURL, uint endTime);
    event Contributed(uint id, address contributor, uint amount);
    event CampaignEnded(uint id);

    function createCampaign(
        string memory title, 
        string memory description, 
        uint target, 
        string memory imageURL, 
        uint endTime
    ) public {
        numCampaigns++;
        Campaign storage newCampaign = campaigns[numCampaigns];
        newCampaign.id = numCampaigns;
        newCampaign.creator = msg.sender;
        newCampaign.title = title;
        newCampaign.startTime = block.timestamp;
        newCampaign.description = description;
        newCampaign.raised = 0;
        newCampaign.endTime = endTime;
        newCampaign.target = target;
        newCampaign.imageURL = imageURL;
        newCampaign.ended = false;

        emit CampaignCreated(numCampaigns, title, description, target, imageURL, endTime);
    }

    function contribute(uint id) public payable {
        require(msg.value > 0, "Contribution must be greater than 0");
        require(!campaigns[id].ended, "Campaign has ended");

        Campaign storage campaign = campaigns[id];
        campaign.contributions[msg.sender] += msg.value;
        campaign.raised += msg.value;

        if (campaign.raised >= campaign.target) {
            campaign.ended = true;
            emit CampaignEnded(id);
        }

        emit Contributed(id, msg.sender, msg.value);
    }
}