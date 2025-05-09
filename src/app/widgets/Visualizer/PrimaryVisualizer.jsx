import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import Icon from '@mdi/react';
import { mdiEmoticonSadOutline } from '@mdi/js';

import * as WebGL from 'app/lib/three/WebGL';
import { GRBL_ACTIVE_STATE_ALARM, GRBL_ACTIVE_STATE_HOLD, WORKFLOW_STATE_IDLE, GRBL_ACTIVE_STATE_DOOR, GRBLHAL } from 'app/constants';
import Widget from 'app/components/Widget';
import ToggleSwitch from 'app/components/ToggleSwitch';
import UnlockButton from 'app/widgets/Visualizer/UnlockButton';
import Wizard from 'app/components/Wizard';
import WorkflowControl from './WorkflowControl';
import MachineStatusArea from './MachineStatusArea';
import ValidationModal from './ValidationModal';
import WarningModal from './WarningModal';
import VisualizerWrapper from './VisualizerWrapper';
import Loading from './Loading';
import Rendering from './Rendering';
import WatchDirectory from './WatchDirectory';
import { MODAL_WATCH_DIRECTORY } from './constants';
import styles from './index.styl';
import SoftLimitsWarningArea from './SoftLimitsWarningArea';
import LoadingAnimation from './LoadingAnimation';


const PrimaryVisualizer = ({ actions, state, capable, showLoading, showRendering, showVisualizer, visualizerRef, workflowRef, widgetContentRef }) => {
    const { liteMode, modal, cameraPosition, invalidLine, invalidGcode, alarmCode, activeState, workflow, isConnected, controller } = state;
    const isHomingAlarm = activeState === GRBL_ACTIVE_STATE_ALARM && alarmCode === 'Homing'; // We are alarmed and
    const holdWithoutWorkflowPause = activeState === GRBL_ACTIVE_STATE_HOLD && workflow.state === WORKFLOW_STATE_IDLE;
    const doorOpen = activeState === GRBL_ACTIVE_STATE_DOOR;
    const showUnlockButton = isConnected && (doorOpen || isHomingAlarm || holdWithoutWorkflowPause);
    const { handleLiteModeToggle, handleRun, reset } = actions;


    const containerID = 'visualizer_container';

    return (
        <Widget className={styles.vizWidgetOverride}>
            <Widget.Header className={styles['visualizer-header']}>
                <Widget.Title>
                    Visualizer
                </Widget.Title>
                <Widget.Controls style={{ top: '-4px' }}>
                    <ToggleSwitch
                        label="Lightweight Mode"
                        checked={liteMode}
                        onChange={() => handleLiteModeToggle()}
                        className={styles.litetoggle}
                        size="md"
                    />
                </Widget.Controls>
            </Widget.Header>
            <Widget.Content
                reference={widgetContentRef}
                className={classNames(
                    { [styles.view3D]: capable.view3D },
                    styles['visualizer-component'],
                )}
                id={containerID}
            >
                {showLoading &&
                    <div className={styles.loaderWrapper}>
                        <Loading />
                        <LoadingAnimation/>
                    </div>
                }
                {showRendering &&
                    <Rendering />
                }
                {modal.name === MODAL_WATCH_DIRECTORY && (
                    <WatchDirectory
                        state={state}
                        actions={actions}
                    />
                )}


                <div className={styles.visualizerWrapper}>
                    <SoftLimitsWarningArea />
                    {
                        (isConnected && (controller.type === GRBLHAL) || showUnlockButton) && <UnlockButton />
                    }
                    <MachineStatusArea
                        state={state}
                        actions={actions}
                    />
                    {
                        WebGL.isWebGLAvailable() ? (
                            <VisualizerWrapper
                                show={showVisualizer}
                                cameraPosition={cameraPosition}
                                ref={visualizerRef}
                                state={state}
                                actions={actions}
                                containerID={containerID}
                                isSecondary={false}
                            />
                        ) : (
                            <div className={styles.visualizerMsgContainer}>
                                <Icon path={mdiEmoticonSadOutline} size={4} />
                                <span style={{ fontSize: '16px' }}>{'It looks like you don\'t support WebGL'}</span>
                            </div>
                        )
                    }
                    <WorkflowControl
                        ref={workflowRef}
                        state={state}
                        actions={actions}
                        invalidGcode={invalidLine.line}
                    />
                    <Wizard />


                    {
                        invalidGcode.shouldShow && invalidGcode.showModal && (
                            <ValidationModal
                                invalidGcode={invalidGcode}
                                onProceed={handleRun}
                                onCancel={reset}
                            />
                        )
                    }
                    {
                        invalidLine.shouldShow && invalidLine.show && (
                            <WarningModal
                                onContinue={actions.lineWarning.onContinue}
                                onIgnoreWarning={actions.lineWarning.onIgnoreWarning}
                                onCancel={actions.lineWarning.onCancel}
                                invalidLine={invalidLine.line}
                            />
                        )
                    }
                </div>
            </Widget.Content>
        </Widget>
    );
};

PrimaryVisualizer.propTypes = {
    actions: PropTypes.object,
    state: PropTypes.object,
    capable: PropTypes.object,
    showLoading: PropTypes.bool,
    showRendering: PropTypes.bool,
    showVisualizer: PropTypes.bool,
    visualizerRef: PropTypes.func,
    workflowRef: PropTypes.func,
    widgetContentRef: PropTypes.func,
    containerID: PropTypes.string,
};

export default PrimaryVisualizer;
