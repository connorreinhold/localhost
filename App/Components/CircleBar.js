import React, {Component} from 'react';
import {Text, View, ART} from 'react-native';
import {Calculate, dimCalculate} from '../Functions/ColorFuncs.js'
import * as shape from 'd3-shape'

const d3 = {shape}
const {Surface, Group, Shape} = ART

const first_quad = 11
const second_quad = 21
const third_quad = 41
const fourth_quad = 100

export function _calculateAngle(numPeople){
    if(numPeople<first_quad){
        angle = (numPeople-2)*(Math.PI/2/(first_quad-2))
        //first 90 degrees
    }
    else if(numPeople<second_quad){
        angle = (numPeople-first_quad)*(Math.PI/2/(second_quad-first_quad))+Math.PI/2
    }
    else if(numPeople<third_quad){
        angle = (numPeople-second_quad)*(Math.PI/2/(third_quad-second_quad))+Math.PI
    }
    else{
        angle = (numPeople-third_quad)*(Math.PI/2/(fourth_quad-third_quad))+3*Math.PI/2
    }
    return angle
}

export default class CircleBar extends Component{
    render(){
        var numPeople = this.props.numPeople;
        let maxPeople = this.props.maxPeople;
        let radius = this.props.radius;
        let end_angle = this.props.end_angle //almost always null unless creating an event
        let borderWidth = (this.props.borderWidth) ? this.props.borderWidth : radius/6 
        let angle_end = 2*Math.PI*numPeople/maxPeople
        var stroke_color = ""
        if(end_angle){
            angle_end = end_angle
            stroke_color = Calculate(end_angle,2*Math.PI)
            numPeople = _calculateNumPeople(angle_end)
        }
        else{
            stroke_color = Calculate(numPeople, maxPeople)
        }
        var arcGenerator = d3.shape.arc()

        var pathData = arcGenerator({
            startAngle: 0,
            endAngle: angle_end,
            innerRadius: radius-borderWidth, 
            outerRadius: radius-borderWidth
          });

        return(
            <View style = {{flex:1,justifyContent: 'center', alignItems: 'center'}}>
                <Surface width = {radius*2} height = {radius*2} >
                    <Group x = {radius} y = {radius}> 
                        <Shape d = {pathData} stroke = {stroke_color} strokeWidth = {borderWidth}
                        /> 
                    </Group>
                </Surface>
                <Text style= {{position: 'absolute', fontFamily: 'Avenir', fontSize : 8+2*radius/9}}>
                    {numPeople}
                </Text>
            </View>
        )
    }
}
