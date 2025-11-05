import React from 'react';
import {
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Chip
} from '@mui/material';
import { Person as PersonIcon } from '@mui/icons-material';

function ActiveUsers({ users }) {
  return (
    <Box sx={{ width: 300, p: 2 }}>
      <Typography variant="h6" gutterBottom>
        Active Users
      </Typography>
      {users.length === 0 ? (
        <Typography variant="body2" color="text.secondary">
          No active users
        </Typography>
      ) : (
        <List>
          {users.map((user) => (
            <ListItem key={user.userId}>
              <ListItemAvatar>
                <Avatar>
                  <PersonIcon />
                </Avatar>
              </ListItemAvatar>
              <ListItemText primary={user.username} />
              <Chip label="Online" color="success" size="small" />
            </ListItem>
          ))}
        </List>
      )}
    </Box>
  );
}

export default ActiveUsers;

