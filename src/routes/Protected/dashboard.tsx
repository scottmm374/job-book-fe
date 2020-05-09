import React, { useState, useEffect } from "react";
import { connect } from "react-redux";
import { withRouter } from "react-router";
import {
  getUser,
  getJobs,
  getCurrentJob,
  updateJob
} from "../../redux/actions/index";
import { DragDropContext, Draggable, Droppable } from "react-beautiful-dnd";
import store from "store";
import DashCard from "./card";
import Loading from "./Loading";
import Message from "../../UIElements/Messages";
import { Header } from "semantic-ui-react";
import { onDragEnd } from "./dragDropContext/onDragEnd";
import { initialColumn } from "./dragDropContext/initialColumn";

const Dashboard = props => {
  const [columns, setColumns] = useState(initialColumn);

  useEffect(() => {
    setTokenForExtension();
    props.getUser();
    props.getJobs();
  }, []);

  useEffect(() => {
    handleJobs();
  }, [props.loading]);

  // This is used for the purpose of the chrome extension to authenticate users once they login
  const setTokenForExtension = () => {
    const token = store.get("okta-token-storage").accessToken.accessToken;
    localStorage.setItem("token", token);
  };

  const handleJobs = () => {
    const filterJobs = columnId => {
      const jobs = props.jobs;
      const filterColumns =
        jobs && jobs.filter(job => job.column_id === columnId);

      return filterColumns;
    };

    const storageCheck = column_id => {
      try {
        const items = localStorage.getItem("destItems");

        if (!items) {
          return undefined;
        }

        const parsedItems = JSON.parse(items);
        const columnChange_id = localStorage.getItem("destId");

        if (columnChange_id === column_id) {
          console.log(columnChange_id);
          return parsedItems;
        }
      } catch (err) {
        console.log(err);
        return undefined;
      }
    };

    props.jobs &&
      setColumns({
        ...columns,
        ["column-1"]: {
          ...columns["column-1"],
          items: !storageCheck("column-1")
            ? filterJobs("column-1")
            : storageCheck("column-1")
        },
        ["column-2"]: {
          ...columns["column-2"],
          items: !storageCheck("column-2")
            ? filterJobs("column-2")
            : storageCheck("column-2")
        },
        ["column-3"]: {
          ...columns["column-3"],
          items: !storageCheck("column-3")
            ? filterJobs("column-3")
            : storageCheck("column-3")
        },
        ["column-4"]: {
          ...columns["column-4"],
          items: !storageCheck("column-4")
            ? filterJobs("column-4")
            : storageCheck("column-4")
        },
        ["column-5"]: {
          ...columns["column-5"],
          items: !storageCheck("column-5")
            ? filterJobs("column-5")
            : storageCheck("column-5")
        }
      });
  };

  return (
    <div style={{ paddingTop: "100px" }}>
      <div>
        {props.error && (
          <Message
            type={"Error"}
            visible={true}
            message={props.error.message}
          />
        )}
        {props.success?.state && props.success?.type == "Deleted" && (
          <Message
            type={"Success"}
            visible={true}
            message={"Successfully Deleted Job"}
          />
        )}

        {!props.loading && props.jobs && props.jobs.length < 1 && (
          <Header as="h2">
            You currently have no jobs saved to your account.
          </Header>
        )}
        {props.loading && <Loading />}
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          height: "100%",
          width: "100%",
          maxWidth: "100%",
          margin: "0, auto"
        }}
      >
        <DragDropContext
          onDragEnd={result =>
            onDragEnd(result, columns, setColumns, props.updateJob)
          }
        >
          {Object.entries(columns).map(([columnId, column], index) => {
            return (
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  width: "262px",
                  verticalAlign: "top",
                  padding: "25px 8px",
                  borderLeft: "1px solid #ece9f2",
                  height: "85vh",
                  overflow: "auto",
                  position: "relative"
                }}
                key={columnId}
              >
                <div
                  style={{
                    zIndex: 100,
                    position: "relative"
                  }}
                >
                  <h2
                    key={index}
                    style={{
                      fontFamily: "Lato",
                      fontSize: "16px",
                      position: "relative",
                      padding: "0px 15px",
                      height: "40px",
                      margin: "10px",
                      overflow: "hidden"
                    }}
                  >
                    {column.name}
                  </h2>
                </div>

                <div style={{ margin: 8 }}>
                  <Droppable droppableId={columnId} key={columnId}>
                    {(provided, snapshot) => {
                      return (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                          style={{
                            background: snapshot.isDraggingOver
                              ? "#B4E4EE"
                              : "",
                            padding: 20,
                            width: 260,
                            height: "auto",
                            minHeight: "67vh",
                            minWidth: 260
                          }}
                        >
                          {props.jobs &&
                            column.items.map((item, index) => {
                              return (
                                <Draggable
                                  key={item.id.toString()}
                                  draggableId={item.id.toString()}
                                  index={index}
                                >
                                  {(provided, snapshot) => {
                                    return (
                                      <div
                                        ref={provided.innerRef}
                                        {...provided.draggableProps}
                                        {...provided.dragHandleProps}
                                      >
                                        {snapshot.isDragging
                                          ? localStorage.setItem(
                                              "jobId",
                                              item.id
                                            )
                                          : null}
                                        <DashCard
                                          key={index}
                                          job={item}
                                          getCurrentJob={props.getCurrentJob}
                                          updateDisabled={props.updateDisabled}
                                        />
                                      </div>
                                    );
                                  }}
                                </Draggable>
                              );
                            })}
                          {provided.placeholder}
                        </div>
                      );
                    }}
                  </Droppable>
                </div>
              </div>
            );
          })}
        </DragDropContext>
      </div>
    </div>
  );
};

function mapStateToProps(state) {
  return {
    user: state.user,
    jobs: state.jobs,
    loading: state.loading,
    error: state.error,
    success: state.success,
    updateDisabled: state.updateDisabled
  };
}

const mapDispatchToProps = {
  getUser,
  getJobs,
  getCurrentJob,
  updateJob
};

export default withRouter(
  connect(mapStateToProps, mapDispatchToProps)(Dashboard)
);
