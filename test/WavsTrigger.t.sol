pragma solidity ^0.8.0;

import {Test} from "forge-std/Test.sol";
import {WavsTrigger, ILayerTrigger} from "../src/WavsTrigger.sol";

contract LayerTriggerTest is Test {
    WavsTrigger t;

    function setUp() public {
        t = new WavsTrigger();
    }

    function testTrigger() public {
        t.addTrigger("service-1", "workflow-1", "data1");

        ILayerTrigger.TriggerId triggerId = ILayerTrigger.TriggerId.wrap(1);
        ILayerTrigger.TriggerResponse memory trigger = t.getTrigger(triggerId);

        assertEq(trigger.serviceId, "service-1");
        assertEq(trigger.workflowId, "workflow-1");
        assertEq(trigger.creator, address(this));
        assertEq(trigger.data, "data1");
        assertEq(ILayerTrigger.TriggerId.unwrap(trigger.triggerId), ILayerTrigger.TriggerId.unwrap(triggerId));
    }
}
