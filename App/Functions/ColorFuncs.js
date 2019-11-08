
const top_bar_color = 'rgb(154,147,236)'
const colorArray = [
    [60,204,193],
    [154,147,236],
]

/* Old colorscheme pre-zain2
const colorArray = [
    [60,204,193],
    [74,131,210],
    [155,71,212],
    [219,64,185],
]
*/
/* MUTED PURPLE SCHEME
const top_bar_color = 'rgb(154,147,236)'
const colorArray = [
    [241,212,234],
    [217,161,239],
    [147,106,204],
    [42,102,196],
    [37,24,215],
]
*/
/* BRIGHT RED SCHEME
const top_bar_color = 'rgb(255,87,51)'
const colorArray = [
    [88,24,69],
    [144,12,63],
    [199,0,57],
    [255,87,51],
    [255,195,0],
]
*/
//the interpolated values for the colors of the circle bars. Each color in format [r,g,b]
//Can have as many arrays as you want. In the above example, the gradient will go from 
//[255,0,0] to [255,255,0] from like 0 to 20% of the way through. 

export function Calculate(numPeople, maxPeople){
    percentage = numPeople/maxPeople;
    rgbarray = _calculateColors(percentage)
    return 'rgb('+rgbarray[0]+','+rgbarray[1]+','+rgbarray[2]+')';
}
export function getTopBarColor(){
    return top_bar_color
}

/**
 * Requires arr1.length = arr2.length
 */
function interpolateTwoArrays(arr1,arr2,percentage_between){
    to_return = []
    for(i =0;i<arr1.length;i++){
        to_return.push(arr1[i]+(arr2[i]-arr1[i])*percentage_between)
    }
    return to_return
}
function _calculateColors(percentage){
    color_index_under = Math.floor(percentage*(colorArray.length-1))
    color_index_over = Math.ceil(percentage*(colorArray.length-1))
    //it is minus one so the final value of the array can be the last element of the array. The gradient
    //is divided among colorArray.length-1 segments
    percentage_between = percentage*(colorArray.length-1) - color_index_under
    new_colors = interpolateTwoArrays(colorArray[color_index_under], colorArray[color_index_over], percentage_between)
    return new_colors;
}
export function dimCalculate(numPeople, maxPeople){
    percentage = numPeople/maxPeople;
    rgbarray = _calculateColors(percentage)
    red = rgbarray[0] + (255-rgbarray[0])/2
    green = rgbarray[1] + (255-rgbarray[1])/2
    blue = rgbarray[2] + (255-rgbarray[2])/2
    return 'rgb('+red+', '+green+', '+blue+')';
}