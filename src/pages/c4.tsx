/* tslint:disable */
import '../styles/c4.scss'
import * as React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'
import * as d3 from 'd3'

const Chart4 = () => {
  React.useEffect(() => renderMyChart(), [])
  const renderMyChart = () => {
    const margin = {top: 50, right: 50, bottom: 50, left: 50}
      , width = 900 - margin.left - margin.right
      , height = 600 - margin.top - margin.bottom;
    const xScale = d3.scaleLinear()
      .domain([0, 10])
      .range([0, width]);
    const yScale = d3.scaleLinear()
      .domain([0, 100])
      .range([height, 0]);
    const svg = d3.select("#c4").append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    svg.append("g")
      .attr("class", "x axis")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale));
    svg.append("g")
      .attr("class", "y axis")
      .call(d3.axisLeft(yScale));

    // For axis on right side
    // svg.append("g")
    //   .attr("class", "y axis")
    //   .attr("transform", `translate(${width}, 0)`)
    //   .call(d3.axisRight(yScale));
  }
  return (
    <Layout>
      <SEO title="Chart 4" keywords={[`gatsby`, `application`, `react`]} />
      <h1>Getting axis ready</h1>
      <div id="c4" />
    </Layout>
  )
}

export default Chart4
