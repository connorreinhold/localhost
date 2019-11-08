import React, {Component} from 'react';
import {Text, View, ART} from 'react-native';
import {Calculate, dimCalculate} from '../../Functions/ColorFuncs.js'
import * as shape from 'd3-shape'

const d3 = {shape}
const {Surface, Group, Shape} = ART
export default class FillCircleBar extends Component{
    
    _renderApplicationsDot(radius, numPeople, maxPeople){
        let dotRadius = radius/2.3
        let dotStyle = {
            backgroundColor: dimCalculate(numPeople, maxPeople), 
            width: dotRadius*2,  
            height: dotRadius*2, 
            position: 'absolute', 
            right: -dotRadius/8, 
            top: -dotRadius/8,
            borderRadius: dotRadius,
            borderWidth: radius/10,
            borderColor: 'white',
        }
        return(
            <View style = {dotStyle}>
                
            </View>
        )
    }
    render(){
        var numPeople = this.props.numPeople;
        let maxPeople = this.props.maxPeople;
        let radius = this.props.radius;
        let end_angle = this.props.end_angle 
        let render_applications = this.props.render_applications

        let angle_end = 2*Math.PI*numPeople/maxPeople
        var stroke_color = Calculate(numPeople,maxPeople)
        if(end_angle){
            angle_end = end_angle
            stroke_color = Calculate(end_angle,2*Math.PI)
            numPeople = this._calculateNumPeople(angle_end)
        }
        innerRadius = 0
        var arcGenerator = d3.shape.arc()
        var circleFill = arcGenerator({
            startAngle: 0,
            endAngle: angle_end,
            innerRadius: innerRadius, 
            outerRadius: radius*9/10 //otherwise the circle gets cut off for some reason. #junkcode
          });

          var circleBorder = arcGenerator({
            startAngle: 0,
            endAngle: 2*Math.PI,
            innerRadius: radius*8/10, 
            outerRadius: radius*9/10 //otherwise the circle gets cut off for some reason. #junkcode
          });
          //https://d3indepth.com/shapes/
        return(
            <View style = {{justifyContent: 'center', alignItems: 'center'}}>
                <View style = {{width: radius*2, height: radius*2}}>
                    <Surface width = {radius*2} height = {radius*2} >
                        <Group x = {radius} y = {radius}> 
                            <Shape fill = {stroke_color} d = {circleFill} stroke = {stroke_color}
                            /> 
                        </Group>
                        <Group x = {radius} y = {radius}> 
                            <Shape fill = {stroke_color} d = {circleBorder} stroke = {stroke_color}
                            /> 
                        </Group>
                    </Surface>
                    {
                        render_applications === true ? 
                            this._renderApplicationsDot(radius, numPeople, maxPeople)
                            : <View/>
                    }
                </View>
            </View>
        )
    }
}
