import React, { Component } from 'react'
import { connect } from 'kea'
import { push } from 'react-router-redux'

import featuresLogic from '../features-logic'

import Highlight from 'react-highlight'

const code = {
  props: require('raw-loader!./code/props.txt'),
  dispatch: require('raw-loader!./code/dispatch.txt'),
  reducer: require('raw-loader!./code/reducer.txt'),
  import: require('raw-loader!./code/import.txt')
}

@connect({
  actions: [
    featuresLogic, [
      'toggleFeature'
    ]
  ],
  props: [
    featuresLogic, [
      'features'
    ]
  ]
})
export default class ConnectedScene extends Component {
  handleRoute = (e) => {
    const { dispatch } = this.props
    const href = e.target.attributes.href.value

    e.preventDefault()
    dispatch(push(href))
    window.scrollTo(0, 0)
  }

  render () {
    const { features } = this.props
    const { toggleFeature } = this.actions

    return (
      <div className='migration-scene'>
        <div className='description'>
          <h2>Migrating existing Redux applications</h2>
          <p>
            Since kea is just redux, it is very easy to connect it to an existing redux application.
          </p>

          <h2>Reading external data</h2>
          <p>
            You may pull in data from any part of the Redux tree with the Kea. For this you will
            use either the <code>{'@connect({ props: [] })'}</code> helper or the <code>{'connect: { props: [] }'}</code> option
            in the <code>{'@kea({})'}</code> function.
          </p>
          <p>
            Instead of passing a kea logic store to <code>props</code> you just pass a selector. Like so:
          </p>
          <Highlight className='javascript'>{code.props}</Highlight>

          <h2>Using external actions</h2>
          <p>
            Kea always adds <code>dispatch</code> as one of the props to your app, so you can easily
            call actions that are defined elsewhere.
          </p>
          <Highlight className='javascript'>{code.dispatch}</Highlight>
          <p>
            You may listen to other actions and either have them influence your reducers or run a saga when they happen.
            Just replace <code>actions.something</code> with <code>MY_TYPE_CONSTANT</code>, like so:
          </p>
          <Highlight className='javascript'>{code.reducer}</Highlight>

          <h2>Using Kea actions and selectors elsewhere</h2>
          <p>
            If the redux-only part of your app needs access to some props or actions from kea logic stores, you can import them like so:
          </p>
          <Highlight className='javascript'>{code.import}</Highlight>
          <p>
            The <a href='/api/logic' onClick={this.handleRoute}>API docs</a> describe what is available to import.
          </p>

          <h2>Next steps</h2>
          <p>
            That's it for the guide!
          </p>
          <p>
            Check out the <a href='/examples/todos' onClick={this.handleRoute}>example applications</a> or read the <a href='/api/logic' onClick={this.handleRoute}>API docs</a>.
          </p>
        </div>
      </div>
    )
  }
}
