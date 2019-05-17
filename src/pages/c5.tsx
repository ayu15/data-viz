import * as React from 'react'
import Layout from '../components/layout'
import SEO from '../components/seo'
import * as d3 from 'd3'
// @ts-ignore
import data from '../../dataset/git-punch.json'

const Chart5 = () => {
  React.useEffect(() => renderMyChart(), [])
  const renderMyChart = () => {
    const margin = { top: 20, right: 20, bottom: 50, left: 50 }
    const width = 600 - margin.left - margin.right
    const height = 200 - margin.top - margin.bottom

    const xScale = d3.scaleLinear().range([0, width])
    const yScale = d3.scaleLinear().rangeRound([0, height])
    const rScale = d3.scaleSqrt().range([0, 10])

    const dayOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thr', 'Fri', 'Sat']

    const svg = d3.select('body')
      .append('svg')
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left}, ${margin.top})`)

    xScale.domain([-0.5, 23.5])
    yScale.domain([-0.5, 6.5])
    rScale.domain([0, d3.max(data, d => d[2])])

    const div = d3.select('#c5').append('div')
      .attr('class', 'tooltip')
      .style('opacity', 0)

    svg.selectAll('dot')
      .data(data)
      .enter().append('circle')
      .attr('r', d => rScale(d[2]))
      .attr('cx', d => xScale(d[1]))
      .attr('cy', d => yScale(d[0]))
      .on('mouseover', d => {
        div.transition()
          .duration(200)
          .style('opacity', .9)
        div.html(`${dayOfWeek[d[0]]}, ${d[1]}<br />${d[2]}`)
          .style('left', (d3.event.pageX) + 'px')
          .style('top', (d3.event.pageY - 28) + 'px')
      })
      .on('mouseout', d => {
        div.transition()
          .duration(500)
          .style('opacity', 0)
      })

    svg.append('g')
      .attr('transform', `translate(0, ${height})`)
      .call(d3.axisBottom(xScale).ticks(24))

    svg.append('g')
      .call(
        d3.axisLeft(yScale)
          .ticks(7)
          .tickFormat((d, i) => dayOfWeek[d]),
      )

    svg.append('text')
      .attr('transform', `translate(${width / 2}, ${(height + margin.top + 15)})`)
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('hour')

    svg.append('text')
      .attr('transform', 'rotate(-90)')
      .attr('y', 0 - margin.left)
      .attr('x', 0 - (height / 2))
      .attr('dy', '1em')
      .style('text-anchor', 'middle')
      .style('font-size', '12px')
      .text('day of week')
  }
  return (
    <Layout>
      <SEO title="Chart 5" keywords={[`gatsby`, `application`, `react`]}/>
      <h1>Git punches</h1>
      <div id="c5"/>
    </Layout>
  )
}

export default Chart5
